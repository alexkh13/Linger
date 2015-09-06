var ObjectID = require('mongodb').ObjectID;
var q = require('q');
var _ = require('underscore');

module.exports = function(db) {




    function findGroups(f) {
        var deferred = q.defer();
        db.collection("groups").find(f).toArray(function(err, docs) {
            if(err) {
                console.log(err);
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

    return {
        insertMessageToDB: function(msgdata)
        {
            var deferred = q.defer();
            db.collection("messages").insert(msgdata, function(err, inserted) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(inserted.ops[0]);
                }
            });
            return deferred.promise;
        },
        getClosestGroups: function(loc, distance) {
            return findGroups({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: loc2arr(loc)
                        },
                        $maxDistance: distance || 2000
                    }
                }
            });
        },
        getClosestClusters: function(loc, distance) {
            return findGroups({
                type: "cluster",
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: loc2arr(loc)
                        },
                        $maxDistance: distance || 2000
                    }
                }
            });
        },
        getGroups: function(f) {
            return findGroups();
        },
        getGroupMessagesBeforeTimestamp: function (data)
        {
            var deferred = q.defer();
            db.collection("messages").find({"groupid": data.groupid,"timestamp": {$lt: data.timestamp}}).limit(20).sort({timestamp:-1}).toArray(function(err, docs) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(docs);
                }
            });

            return deferred.promise;
        },
        insertCluster: function(loc, name) {
            var deferred = q.defer();

            var group = {
                name: name,
                type: "cluster",
                location: loc2arr(loc)
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
        updateGroup: function(groupId, data) {
            var deferred = q.defer();
            var criteria = _.isArray(groupId) ? { _id: { $in: groupId } } : { _id: groupId };
            db.collection("groups").update(criteria, { $set: data }, function(err) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve()
                }
            });
            return deferred.promise;
        },
        insertGroup: function(name, loc, clusterId, image) {
            var deferred = q.defer();

            var group = { name: name, type: "point", location: loc2arr(loc), cluster: clusterId, image: image};
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
        getUserById: function(id) {
            var deferred = q.defer();
            db.collection("users").findOne({ _id: new ObjectID(id) }, function(err, user) {
                if(err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(user);
                }
            });
            return deferred.promise;
        },
        updateUser: function(id, profile, accessToken) {
            var deferred = q.defer();
            db.collection("users").findAndModify(
                { id: id },
                null,
                { $set: { accessToken: accessToken }, $setOnInsert: profile },
                { new: true, upsert: true },
                function(err, inserted) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(inserted.value)
                    }
                });
            return deferred.promise;
        }
    }
};