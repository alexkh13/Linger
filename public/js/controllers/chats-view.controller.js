angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state", function ($scope, $state) {

    $scope.chats = [
        {
            name: "test group",
            group: true
        }
    ];

    $scope.go = function(id) {
        $state.go("main.chat", {
            id: id
        });
    }

}]);



