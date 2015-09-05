angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http","lingerSocket","notificationsManager", "Restangular", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http,lingerSocket,notificationsManager, Restangular) {

    notificationsManager.GetGroupNameById($stateParams.id).then(function(room) {
        $scope.title = room.GroupName;
    });

    $scope.messages = lingerAPI.msg.query({groupid: $stateParams.id, timestamp: new Date().toUTCString()}, function(docs){

        $scope.messages.push.apply($scope.messages, docs);
    });

    notificationsManager.register($stateParams.id, function(data){
            $scope.messages.push(data);
        }
    );

    $scope.$on("$destroy", function() {
        notificationsManager.unregister($stateParams.id);
    });

    $scope.go = function(friend) {
        $state.go("main.chat", {
            id: friend.name.first.capitalize() + " " +  friend.name.last.capitalize()
        })
    };

    $scope.messages = [];
    var answers = [];

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



