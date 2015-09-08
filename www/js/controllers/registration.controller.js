angular.module("linger.controllers").controller("RegistrationController", [ "$scope", "$state", "$http", "lingerAPI", "$mdDialog", function ($scope, $state, $http, lingerAPI, $mdDialog) {

    $scope.user = {};

    function alert(title, message) {
        var alert = $mdDialog.alert({
            title: title,
            content: message,
            ok: 'OK'
        });
        $mdDialog
            .show( alert )
            .finally(function() {
                alert = undefined;
            });
    }

    $scope.register = function() {
        if(!$scope.user.email) {
            return alert("Missing info", "Email is empty.")
        }
        if(!$scope.user.name) {
            return alert("Missing info", "Full name is empty.")
        }
        if(!$scope.user.password) {
            return alert("Missing info", "Password is empty.")
        }
        if($scope.user.password != $scope.passwordRepeat) {
            return alert("Passwords mismatach", "Passwords do not match.")
        }
        var user = angular.copy($scope.user);
        $http.post(BACKEND_SERVER_URL + "api/user/register", user).then(function(result) {
            lingerAPI.auth.basicLogin(user, function() {
                $state.go("main", null, {
                    location: "replace"
                });
            });
        }, function(err) {
            alert("Error", "Email already exists.");
        });
    }

}]);



