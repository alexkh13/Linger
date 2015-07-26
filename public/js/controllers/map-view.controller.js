angular.module("linger.controllers").controller("MapViewController", [ "$scope", "lingerSocket", function ($scope, lingerSocket) {

    var map = $scope.map = [];

    lingerSocket.on("markers:created", function(obj) {
        map.push(obj);
    });

    lingerSocket.on("markers:initialize", function(data) {
        angular.forEach(data, function(obj) {
            map.push(obj);
        })
    });

}]);



