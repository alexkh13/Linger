var chat = require('express').Router();
var geolib = require('./geolib');
var qr = require('qr-image');
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

/**
 * Get Closest groups
 */
GroupUsers = {};

chat.get("/", function(req, res) {
    var loc = {
        longitude: parseFloat(req.query.longitude),
        latitude: parseFloat(req.query.latitude)
    };
    req.db.getClosestClusters(loc).then(function(clusters) {
        var clustersById = _.indexBy(clusters, "_id");
        var clusterIds = _.pluck(clusters, "_id");
        req.db.getGroups({ type: "point", cluster: { $in: clusterIds }}).then(function(points) {
            _.each(points, function(point) {
                if (point.cluster && clustersById[point.cluster]) {
                    if(!clustersById[point.cluster].points) {
                        clustersById[point.cluster].points = [];
                    }
                    clustersById[point.cluster].points.push(point);
                }
            });
            res.send(_.values(clustersById));
        });
    }, handleError);
});

/**
 * Get group
 */
chat.get("/:groupid", function(req, res) {
    req.db.getGroup(req.params.groupid).then(function(doc) {
        switch(doc.type) {
            case "personal":
                // expose only real user name
                var userId = doc.initiator.id == req.user._id.id ? doc.target : doc.initiator;
                req.db.findUser(userId).then(function(user) {
                    res.send({
                        type: "personal",
                        name: user.name,
                        image: (user.picture||{}).image
                    });
                }, handleError);
                break;
            default:
                return res.send(doc);

        }
    }, handleError);
});

/**
 * Get group's QR code
 */
chat.get("/:groupid/qr", function(req, res) {
    var qr_png = qr.image(BACKEND_SERVER_URL + '#/chat/' + req.params.groupid, { type: 'png' });
    qr_png.pipe(res);
});

/**
 * Get last messages for group before timestamp
 */
chat.get("/:groupid/message/:timestamp",function(req,res){
        req.db.getGroupMessagesBeforeTimestamp({
            "groupid": req.params.groupid,
            "timestamp": req.params.timestamp
        }).then(function (docs)
        {
            if(!GroupUsers[req.params.groupid]) {
                GroupUsers[req.params.groupid] = [];
                GroupUsers[req.params.groupid] = _.indexBy({},"id",function(a){return a});
            }

            GroupUsers[req.params.groupid].push(req.user);

            req.io.sockets.in(req.params.groupid).emit('adduser',{user: req.user, groupid:req.params.groupid});

            res.send([docs, GroupUsers[req.params.groupid]]);
        }, handleError);
});

chat.post("/leave", function(req, res) {

    //GroupUsers[req.params.groupid].find(req.user)
    //GroupUsers[req.body.groupid] = _.without(GroupUsers[req.body.groupid], _.findWhere(GroupUsers[req.body.groupid], {id: req.user.id}));

    req.io.sockets.in(req.body.groupid).emit('removeuser',{user: req.user, groupid:req.body.groupid});

    res.end();
});

/**
 * Post a message to group
 */
chat.post("/:groupid/message", function(req, res) {

    // so the message data needs to contain the message string and the groupid and the sending userid
   // var data = ;
    var date = new Date().toUTCString();

    var DBdata = {
      timestamp:date,
      message:req.body.msgdata,
      groupid:req.params.groupid,
      userid:req.user._id
    };

    // Push the message into the messages db
    req.db.insertMessageToDB(DBdata).then(function(docs)
    {
       res.end();
    },handleError);

    //TODO: implement GCM send the message to all other members of the room
    req.io.sockets.in(req.params.groupid).emit('updatechat',{"groupid":req.params.groupid,"timestamp":date,"message":req.body.msgdata, "userid":req.user._id});
});

/**
 * Create group
 */
chat.post("/", function(req, res) {

    if (req.body.target) {
        req.db.insertPrivateGroup(req.user._id, req.body.target).then(function(group) {
            res.send(group);
        }, handleError);
        return;
    }

    var params = {
        groupName: req.body.groupName,
        clusterName: req.body.clusterName,
        location: {
            longitude: parseFloat(req.body.location.longitude),
            latitude: parseFloat(req.body.location.latitude)
        },
        image: req.body.image
    };

    function pluckLocations(objs) {
        return _.map(objs, function(obj) {
            return {
                longitude: obj.location[0],
                latitude: obj.location[1]
            }
        });
    }

    function getCenter(points) {
        var c = geolib.getCenter(points);
        return {
            longitude: parseFloat(c.longitude),
            latitude: parseFloat(c.latitude)
        }
    }

    req.db.getClosestGroups(params.location, 150).then(function(docs) {

        function insertGroup(clusterId) {
            req.db.insertGroup(params.groupName, params.location, clusterId, params.image).then(function(group) {
                // when added to a cluster, we need to update cluster location accordingly
                if (clusterId) {
                    req.db.getGroups({
                        type: "point",
                        cluster: clusterId
                    }).then(function(points) {
                        var clusterLocation = getCenter(pluckLocations(points).concat(params.location));
                        req.db.updateGroup(clusterId, {
                            location: [clusterLocation.longitude, clusterLocation.latitude]
                        });
                        req.db.updateGroup(_.pluck(points, "_id"), {
                            clusterLocation: [clusterLocation.longitude, clusterLocation.latitude]
                        });
                    });
                }
                res.send(group);
            }, handleError);
        }

        if(docs.length) {
            if(docs[0].type == "cluster") {
                insertGroup(docs[0]._id);
            }
            else {

                function createNewCluster() {
                    var points = _.filter(docs, function(doc) {
                        return doc.type == "point" && !doc.cluster;
                    });
                    var clusterLocation = getCenter(pluckLocations(points).concat(params.location));
                    req.db.insertCluster(clusterLocation, params.clusterName).then(function(cluster) {
                        req.db.updateGroup(_.pluck(points, "_id"), {
                            cluster: cluster._id
                        }).then(function() {
                            insertGroup(cluster._id);
                        }, handleError);
                    }, handleError);
                }

                if (docs[0].cluster) {
                    req.db.getGroup(docs[0].cluster).then(function(cluster) {
                        if (geolib.getDistance(params.location, cluster.location) < 300) {
                            insertGroup(docs[0].cluster);
                        }
                        else {
                            createNewCluster();
                        }
                    })
                }
                else {
                    createNewCluster();
                }
            }
        }
        else {
            req.db.insertCluster(params.location, params.clusterName).then(function(cluster) {
                insertGroup(cluster._id);
            }, handleError);
        }

    },handleError);
});

module.exports = chat;