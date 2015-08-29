angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state", function ($scope, $state) {

    $scope.chats = [
        {
            image: 1,
            name: "test group",
            group: true
        },
        {
            image: 2,
            name: "test group",
            group: true
        },
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



