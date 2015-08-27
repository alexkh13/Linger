var chat = require('express').Router();
var geolib = require('./geolib');
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

/**
 * Get all groups
 */
chat.get("/", function(req, res) {
    req.db.getGroups().then(function (docs) {
        res.send(docs);
    }, handleError);
});

/**
 * Get all groups close to a specific location
 */
chat.get("/:longitude/:latitude", function(req, res) {
    var loc = {
        longitude: parseFloat(req.params.longitude),
        latitude: parseFloat(req.params.latitude)
    };
    req.db.getClosestGroups(loc).then(function(docs) {
        res.send(docs);
    }, handleError);
});

/**
 * Create group
 */
chat.post("/", function(req, res) {

    var params = {
        name: req.body.name,
        location: {
            longitude: parseFloat(req.body.location.longitude),
            latitude: parseFloat(req.body.location.latitude)
        }
    };

    function notifyall(cluster) {
        req.io.sockets.emit("markers:created", cluster);
        res.end();
    }

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

    req.db.getClosestGroups(params.location).then(function(docs) {

        function insertGroup(clusterId) {
            req.db.insertGroup(name, params.location, clusterId).then(function(group) {
                req.io.sockets.emit("markers:created", group);
                res.end();
            }, handleError);
        }

        if(docs.length) {
            if(docs[0].type == "cluster") {
                insertGroup(docs[0]._id);
                //req.db.updateCluster(docs[0]._id, getCenter(pluckLocations(docs[0].points).concat(loc))).then(function() {
                //    req.db.appendCluster(docs[0]._id, loc).then(function(cluster) {
                //        notifyall(cluster);
                //    }, handleError);
                //}, handleError);
            }
            else {
                var points = _.filter(docs, function(obj) { return obj.type != "cluster" });
                if (docs[0].cluster) {
                    insertGroup(docs[0].cluster);
                }
                else {
                    req.db.insertCluster(getCenter(pluckLocations(points).concat(loc))).then(function(cluster) {
                        req.db.updateGroup(docs[0]._id, {
                            cluster: cluster._id
                        });
                        insertGroup(cluster._id);
                        //req.db.appendCluster(cluster._id, loc).then(function(cluster) {
                        //    req.db.removeIds(_.pluck(points, "_id")).then(function() {
                        //        notifyall(cluster);
                        //    }, handleError);
                        //}, handleError)
                    }, handleError);
                }

            }
        }
        else {
            insertGroup();
        }

    },handleError);
});

module.exports = chat;