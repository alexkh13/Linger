var geo = require('express').Router();
var geolib = require('./geolib');
var _ = require('underscore');

function handleError(err) {
    console.log(err);
    res.status(500);
    res.end();
}

geo.get("/", function(req, res) {
    req.db.getGroups().then(function (docs) {
        res.send(docs);
    }, handleError);
});

geo.get("/:longitude/:latitude", function(req, res) {
    var loc = {
        longitude: parseFloat(req.params.longitude),
        latitude: parseFloat(req.params.latitude)
    };
    req.db.getClosestGroups(loc).then(function(docs) {
        res.send(docs);
    }, handleError);
});

geo.post("/", function(req, res) {
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

    var loc = {
        longitude: parseFloat(req.body.longitude),
        latitude: parseFloat(req.body.latitude)
    };

    req.db.getClosestGroups(loc).then(function(docs) {
        if(docs.length) {
            if(docs[0].type == "cluster") {
                req.db.updateCluster(docs[0]._id, getCenter(pluckLocations(docs[0].points).concat(loc))).then(function() {
                    req.db.appendCluster(docs[0]._id, loc).then(function(cluster) {
                        notifyall(cluster);
                    }, handleError);
                }, handleError);
            }
            else {
                var points = _.filter(docs, function(obj) { return obj.type != "cluster" });
                req.db.insertCluster(getCenter(pluckLocations(points).concat(loc)), points).then(function(cluster) {
                    req.db.appendCluster(cluster._id, loc).then(function(cluster) {
                        req.db.removeIds(_.pluck(points, "_id")).then(function() {
                            notifyall(cluster);
                        }, handleError);
                    }, handleError)
                }, handleError);
            }
        }
        else {
            req.db.insertGroup(loc).then(function(group) {
                req.io.sockets.emit("markers:created", group);
                res.end();
            }, handleError);
        }
    },handleError);
});

module.exports = geo;