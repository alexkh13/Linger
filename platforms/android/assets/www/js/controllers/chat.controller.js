angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http","lingerSocket","notificationsManager", "Restangular", "UserService", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http,lingerSocket,notificationsManager, Restangular, UserService) {

    $scope.MyUserId = UserService.getUser()._id;

    notificationsManager.GetGroupById($stateParams.id).then(function(room) {
        $scope.title = room.name;
        $scope.public = room.type != "personal";
    });

    lingerSocket.emit('subscribe', {groupid:$stateParams.id});

    $scope.messages = [];

    $scope.friends = [];

    $scope.myImage = (UserService.getUser().picture||{}).image;

    $http.get(BACKEND_SERVER_URL + "api/chat/" + $stateParams.id + "/message/" + new Date().toUTCString()).then(function(result) {
        var users = result.data.users;
        var messages = result.data.messages;
        var active = result.data.active;

        $scope.messages = _.map(_.sortBy(messages, "timestamp"), function(message) {
            return _.extend(message, {
                me: message.userid == UserService.getUser()._id
            })
        });

        $scope.users = _.indexBy(users, "_id");

        angular.forEach($scope.users, function(user) {
            user.active = active[user._id];
        });

        $scope.$broadcast("scrollToBottom");
    });

    notificationsManager.register($stateParams.id, {
        onIncomingMessage: function (message){

            $scope.messages.push( _.extend(message, {
                me: message.userid == UserService.getUser()._id
            }));

            $scope.$broadcast("scrollToBottom");
        },
        onUserLeave: function(user) {
            $scope.users[user._id].active = false;
        },
        onUserJoin: function(user) {
            $scope.users[user._id] = user;
            $scope.users[user._id].active = true;
        }
    });

    $scope.$on("$destroy", function() {
        notificationsManager.unregister($stateParams.id);

        lingerAPI.leaveGroup.save({groupid: $stateParams.id});
    });

    $scope.send = function() {
        //$scope.messages.push({
        //    //me: true,
        //    //owner: "Alex Khmelnitsky",
        //    //content: $scope.message,
        //    //time: "18:37"
        //}
        if(!$scope.message) return;
        // getting the froup messages - Consult alex groupid
        var sendData = { msgdata:$scope.message };
        $scope.message = "";
        Restangular.one('chat', $stateParams.id).customPOST(sendData, "message");
    };

    $(".chat-input").on("keydown", function(ev) {
        if(ev.keyCode ==13 ) {
            $scope.$apply($scope.send);
        }
    });

    $scope.go = function(user) {
        if(user._id == $scope.MyUserId) return;
        $http.post(BACKEND_SERVER_URL + "api/chat", {
            target: user._id
        }).then(function(result) {
            lingerSocket.emit("subscribe", { room: result.data._id });
            $state.go("main.chat", {
                id: result.data._id
            });
        })
    }

}]);



