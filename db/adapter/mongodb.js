var ObjectID = require('mongodb').ObjectID;
var q = require('q');
var _ = require('underscore');

module.exports = function(db) {

    function findGroups(f) {
        var deferred = q.defer();
        db.collection("groups").find(f).toArray(function(err, docs) {
            if(err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(docs);
            }
        });
        return deferred.promise;
    }

    function loc2arr(loc) {
        return [ loc.longitude, loc.latitude ];
    }

    var self = {
        getClosestGroups: function(loc) {
            return findGroups({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: loc2arr(loc)
                        },
                        $maxDistance: 200
                    }
                }
            });
        },
        getGroups: function() {
            return findGroups();
        },
        insertCluster: function(loc, points) {
            var deferred = q.defer();

            var group = {
                type: "cluster",
                location: loc2arr(loc),
                points: points
            };

            db.collection("groups").insert(group, function(err, inserted) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(inserted.ops[0]);
                }
            });

            return deferred.promise;
        },
        removeIds: function(ids) {
            var deferred = q.defer();
            db.collection("groups").remove({ _id: { $in: ids }}, function(err, c) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(c);
                }
            });
            return deferred.promise;
        },
        appendCluster: function(clusterId, loc) {
            var deferred = q.defer();
            db.collection("groups").findOne({ _id: clusterId}, function(err, cluster) {
                var data =  {
                    points: cluster.points.concat([{
                        _id: new ObjectID(),
                        location: loc2arr(loc)
                    }])
                };
                db.collection("groups").update({ _id: clusterId }, { $set: data }, function(err) {
                    if(err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(_.extend(cluster, data));
                    }
                });
            });
            return deferred.promise;
        },
        updateCluster: function(clusterId, loc) {
            var deferred = q.defer();
            var data = {
                location: loc2arr(loc)
            };
            db.collection("groups").update({ _id: clusterId }, { $set: data }, function(err) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve()
                }
            });
            return deferred.promise;
        },
        insertGroup: function(loc) {
            var deferred = q.defer();

            var group = { type: "point", location: loc2arr(loc) };
            db.collection("groups").insert(group, function(err, inserted) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(inserted.ops[0]);
                }
            });

            return deferred.promise;
        }
    };

    return self;
};