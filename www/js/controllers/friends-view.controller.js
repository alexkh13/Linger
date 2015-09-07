angular.module("linger.controllers").controller("FriendsViewController", [ "$scope", "$http", "UserService", "$state", "Restangular", "lingerSocket", function ($scope, $http, UserService, $state, Restangular, lingerSocket) {
    $scope.users = Restangular.all("user/lookup").getList().$object;

    $scope.go = function(user) {
        $http.post(BACKEND_SERVER_URL + "api/chat", {
            target: user._id
        }).then(function(result) {
            lingerSocket.emit("subscribe", { room: result.data._id });
            $state.go("main.chat", {
                id: result.data._id
            });
        })
    }
}]);
