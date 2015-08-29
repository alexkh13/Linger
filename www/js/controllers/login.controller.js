angular.module("linger.controllers").controller("LoginController", [ "$scope", "$window", "$stateParams", "$location", function ($scope, $window, $stateParams, $location) {

    $scope.loginFacebook = function() {
        $window.location.replace("/api/auth/facebook");
    }

}]);



