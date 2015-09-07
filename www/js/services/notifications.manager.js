/**
 * Created by Brutus on 30/08/2015.
 */
angular.module("linger.services").factory("notificationsManager",["$q", "$stateParams","lingerSocket", "localStorageService", "$cordovaGeolocation", "lingerAPI", function($q, $stateParams, lingerSocket, localStorageService, $cordovaGeolocation, lingerAPI) {
    var rooms = {};

    var registeredControllers = {};
    var messageQueue = localStorageService.get("MQ") || {};

    lingerSocket.on("updatechat", function(data){

        if(registeredControllers[data.groupid])
        {
            registeredControllers[data.groupid](data);
            // TODO Ask Alex how to reference the messages + identify that owner sent it - data.owner
            //$scope.messages.push({"owner":data.owner, "content":data.msg, "time":data.time});
        }
        else
        {
            if(!messageQueue[data.groupid])
            {
                messageQueue[data.groupid] = [];
            }
            messageQueue[data.groupid].push(data);
            localStorageService.set("MQ",messageQueue);

            // Local notifications
//             cordova.plugins.notification.local.schedule({
//                 title: "New Message",
//                 message: data.message,
//                 icon: "image/mlogo.png"
//             });
        }
    });

    var roomsDeferred = $q.defer();

    $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false}).then(function(data) {
        var loc = {
            latitude: data.coords.latitude,
            longitude: data.coords.longitude
        };

        lingerAPI.chat.query(loc, function(groups) {
            roomsDeferred.resolve(rooms = _.indexBy(_.flatten(_.pluck(groups, "points")), "_id"));
        });
    },function(err)
    {
        console.log(err);
    });

    return({
        register: function(groupid, callback) {
            registeredControllers[groupid] = callback;
            _.each(messageQueue[groupid], function(data) {

                callback(data);
            });
            if(messageQueue[groupid]) {
                messageQueue[groupid].length = 0;
                localStorageService.set("MQ", messageQueue);
            }
        },
        unregister: function(groupid) {
            delete registeredControllers[groupid];
        },
        GetGroupById: function(groupid)
        {
            if (rooms[groupid]) return $q.when(rooms[groupid]);
            return roomsDeferred.promise.then(function(r) {
                if (r[groupid]) {
                    return r[groupid];
                }
                else {
                    return lingerAPI.chat.getGroup({id:groupid}).$promise.then(function(data) {
                        return rooms[data._id] = data;
                    });
                }
            });
        }
    //function clearRoomNotifications(groupid)
    //{
    //
    //}
});

}]);