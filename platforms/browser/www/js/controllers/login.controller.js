angular.module("linger.controllers").controller("LoginController", [ "$scope", "lingerAPI", "$cordovaFacebook", function ($scope, lingerAPI, $cordovaFacebook) {

    $scope.loginFacebook = function() {
        $cordovaFacebook.login(['user_about_me', 'user_friends'])
            .then(function(success) {
                lingerAPI.auth.facebookLogin(success.authResponse);
            }, function (error) {
                // error
            });
    }

}]);



