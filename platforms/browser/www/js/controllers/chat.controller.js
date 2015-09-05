angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http","lingerSocket","notificationsManager", "Restangular", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http,lingerSocket,notificationsManager, Restangular) {

    notificationsManager.GetGroupNameById($stateParams.id).then(function(room) {
        $scope.title = room.name;
    });

    var dummy = [];
    dummy.length = 20;

    var promises = _.map(dummy, function() {
        return $http.get("https://randomuser.me/api/");
    });

    $q.all(promises).then(function(results) {
        $scope.friends = _.map(results,function(obj) {
            return obj.data.results[0].user
        });
        lingerAPI.friends = _.indexBy($scope.friends, "registered");
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



