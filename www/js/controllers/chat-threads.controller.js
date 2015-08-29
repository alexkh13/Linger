angular.module("linger.controllers").controller("ChatThreadsController", [ "$scope", "$state", function ($scope, $state) {
    $scope.go = function(id) {
        $state.go("main.chat.conversation", {
            thread: id,
            id: id
        });
    }
}]);



