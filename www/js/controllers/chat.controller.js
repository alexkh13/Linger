angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http","lingerSocket","notificationsManager", "Restangular", "UserService", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http,lingerSocket,notificationsManager, Restangular, UserService) {

    notificationsManager.GetGroupNameById($stateParams.id).then(function(room) {
        $scope.title = room.name;
    });

    $scope.messages = [];

    $scope.myImage = UserService.getUser().picture.image;

    lingerAPI.msg.query({groupid: $stateParams.id, timestamp: new Date().toUTCString()}, function(messages) {
        $scope.messages = _.map(_.sortBy(messages, "timestamp"), function(message) {
            return _.extend(message, {
                me: message.userid == UserService.getUser()._id
            })
        });
        $scope.$broadcast("scrollToBottom");
    });

    notificationsManager.register($stateParams.id, function(data){
        if (UserService.getUser()._id == data.userid) {
            data.me = true;
        }
        $scope.messages.push(data);
        $scope.$broadcast("scrollToBottom");
    });

    $scope.$on("$destroy", function() {
        notificationsManager.unregister($stateParams.id);
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

}]);



