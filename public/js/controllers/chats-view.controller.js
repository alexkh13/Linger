angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state", function ($scope, $state) {

    $scope.chats = [
        { name: "test1" },
        { name: "test2" },
        { name: "test3" },
        { name: "test4" },
        { name: "test5" },
        { name: "test6" },
        { name: "test6" },
        { name: "test1" },
        { name: "test2" },
        { name: "test3" },
        { name: "test4" },
        { name: "test5" },
        { name: "test6" },
        { name: "test6" }
    ];

    $scope.go = function() {
        $state.go("main.chat");
    }

}]);



