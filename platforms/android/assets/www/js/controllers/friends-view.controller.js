angular.module("linger.controllers").controller("FriendsViewController", [ "$scope", "$timeout", "lingerSocket", "lingerAPI", "geolocation", function ($scope, $timeout, lingerSocket, lingerAPI, geolocation) {

    $scope.friends = [
        { name: "test1" },
        { name: "test2" },
        { name: "test3" },
        { name: "test4" },
        { name: "test5" },
        { name: "test6" }
    ]

}]);



