angular.module("linger.controllers").controller("MapViewController", [ "$scope", "$timeout", "lingerSocket", "lingerAPI", "geolocation", function ($scope, $timeout, lingerSocket, lingerAPI, geolocation) {

    var map = $scope.map = [];

    lingerSocket.on("markers:created", function(obj) {
        map.push(obj);
    });

    lingerSocket.on("markers:initialize", function(data) {
        angular.forEach(data, function(obj) {
            map.push(obj);
        })
    });

    map = lingerAPI.geo.query(function() {
        $scope.map = map;
    });

    geolocation.getLocation().then(function(data) {
        $scope.currentLocation = {
            lat: data.coords.latitude,
            lng: data.coords.longitude
        }
    });

    //$scope.currentLocation = {
    //    lat: 32.0473761,
    //    lng: 34.7611808
    //}

}]);



