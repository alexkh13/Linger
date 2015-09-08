angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http","lingerSocket","notificationsManager", "Restangular", "UserService", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http,lingerSocket,notificationsManager, Restangular, UserService) {

    notificationsManager.GetGroupById($stateParams.id).then(function(room) {
        $scope.title = room.name;
    });

    lingerSocket.emit('subscribe', {groupid:$stateParams.id});

    $scope.messages = [];

    $scope.friends = [];

    $scope.myImage = (UserService.getUser().picture||{}).image;

    lingerAPI.msg.query({groupid: $stateParams.id, timestamp: new Date().toUTCString()}, function(data) {

        $scope.messages = _.map(_.sortBy(data[0], "timestamp"), function(message) {
            return _.extend(message, {
                me: message.userid == UserService.getUser()._id
            })
        });
        $scope.$broadcast("scrollToBottom");

        $scope.friends = _.indexBy(data[1],"_id",function(a){return a});

        //$scope.friends = _.without($scope.friends, _.findWhere($scope.friends, {_id: UserService.getUser()._id}));
    });


    notificationsManager.register($stateParams.id, function(data){

        // In case new messages arrived
        if(data.messages) {
            if (UserService.getUser()._id == data.messages.userid) {
                data.messages.me = true;
            }
            $scope.messages.push(data.messages);

            $scope.$broadcast("scrollToBottom");
        }
        // In case new friends arrived
        else
        {
            if(data.add == 0)
            {
                //$scope.friends.remove(data.user._id);
                $scope.friends = _.without($scope.friends, _.findWhere($scope.friends, {_id: data.user._id}));
            }
            else
            {
                $scope.friends.push(data.user);
            }
            // Scroll bottom for friends
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



