angular.module("linger.controllers").controller("LoginController", [ "$scope", "$state", "lingerAPI", "$cordovaFacebook", "$mdDialog", function ($scope, $state, lingerAPI, $cordovaFacebook, $mdDialog) {

    $scope.loginFacebook = function() {
        $cordovaFacebook.login(['user_about_me', 'user_friends'])
            .then(function(success) {
                lingerAPI.auth.facebookLogin(success.authResponse, function(user) {
                    $state.go("main", null, {
                        location: "replace"
                    });
                });
            }, function (error) {
                // error
            });
    };

    $scope.loginBasic = function() {
        lingerAPI.auth.basicLogin({ email: $scope.email, password: $scope.password }, function() {
            $state.go("main", null, {
                location: "replace"
            });
        },
        function() {
            var alert = $mdDialog.alert({
                title: "Bad Credentials",
                content: "Wring username or password.",
                ok: 'Try Again'
            });
            $mdDialog
                .show( alert )
                .finally(function() {
                    alert = undefined;
                });
        });
    };

    $scope.goRegister = function() {
        $state.go("registration");
    }

}]);



