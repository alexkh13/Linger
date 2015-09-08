var ObjectID = require('mongodb').ObjectID;
var q = require('q');
var _ = require('underscore');

module.exports = function(db) {

    function find(collection, f, single) {
        var col = db.collection(collection);
        var method = single ? col.findOne : col.find;
        var deferred = q.defer();
        var h = function(err, docs) {
            if(err) {
                console.log(err);
                deferred.reject(err);
            }
            else {
                deferred.resolve(docs);
            }
        };
        var args = single ? [f, h] : [f];
        var result = method.apply(col, args);
        if(!single) {
            result.toArray(h);
        }
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
            return find("groups", {
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
            return find("groups", {
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
            return find("groups", f);
        },
        getGroup: function(id) {
            return find("groups", { _id: new ObjectID(id) }, true);
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
        insertPrivateGroup: function(initiator, target) {
            var deferred = q.defer();

            target = new ObjectID(target);

            db.collection('groups').findAndModify(
                { $or: [ { initiator: initiator, target: target }, {initiator: target, target: initiator}] }, // query
                null,  // sort order
                { type: "personal", initiator: initiator, target: target}, // insert
                { upsert: true }, // options: insert
                function(err, object) {
                    if(err) {
                        deferred.reject(err);
                    }
                    else {
                        if(object.lastErrorObject && object.lastErrorObject.upserted) {
                            find("groups", { _id: object.lastErrorObject.upserted}, true).then(function(object) {
                                deferred.resolve(object);
                            });
                        }
                        else {
                            deferred.resolve(object.value);
                        }
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
        },
        findUsers: function(luid) {
            return find("users", { _id: { $not: { $in: [luid] } } });
        },
        findUser: function(uid) {
            return find("users", { _id: new ObjectID(uid) }, true);
        },
        addUser: function(user) {
            var deferred = q.defer();
            find("users", { email: user.email }, true).then(function(doc) {
                if(!doc) {
                    db.collection("users").insert(user, function(err, res) {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve(user)
                        }
                    });
                }
                else {
                    deferred.reject(false);
                }
            });
            return deferred.promise;
        },
        checkUser: function(email, password) {
            var deferred = q.defer();
            db.collection("users").findOne({ email: email, password: password }, function(err, doc) {
                if (err || !doc) {
                    deferred.reject(err || false);
                }
                else {
                    deferred.resolve(doc)
                }
            });
            return deferred.promise;
        }
    }
};