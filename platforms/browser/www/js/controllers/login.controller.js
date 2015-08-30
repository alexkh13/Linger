angular.module("linger.controllers").controller("LoginController", [ "$scope", "$state", "lingerAPI", "$cordovaFacebook", function ($scope, $state, lingerAPI, $cordovaFacebook) {

    $scope.loginFacebook = function() {
        $cordovaFacebook.login(['user_about_me', 'user_friends'])
            .then(function(success) {
                lingerAPI.auth.facebookLogin(success.authResponse, function(user) {
                    $state.go("main", {
                        location: "replace"
                    });
                });
            }, function (error) {
                // error
            });
    }

}]);



