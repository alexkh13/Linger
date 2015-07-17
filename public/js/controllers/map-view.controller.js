angular.module("linger.controllers").controller("MapViewController", [ "$scope", "lingerSocket", function ($scope, lingerSocket) {

    var map = $scope.map = [];

    lingerSocket.on("markers:created", function(loc) {
        console.log(loc);
        map.push({
            location: loc
        });
    });

}]);



