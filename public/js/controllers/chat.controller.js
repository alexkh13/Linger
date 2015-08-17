angular.module("linger.controllers").controller("ChatController", [ "$scope", "$state", "$stateParams", "$location", function ($scope, $state, $stateParams, $location) {

    $scope.title = $stateParams.id;

    $scope.go = function(options) {
        $state.go("main.chat.conversation", {
            thread: "public"
        }, options);
    };

}]);



