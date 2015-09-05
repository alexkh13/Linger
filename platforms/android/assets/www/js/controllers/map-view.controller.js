angular.module("linger.controllers").controller("MapViewController", [ "$scope", "$http", "$state", "$timeout", "lingerSocket", "lingerAPI", "$cordovaGeolocation", function ($scope, $http, $state, $timeout, lingerSocket, lingerAPI, $cordovaGeolocation) {

    var map = $scope.map = [];

    $cordovaGeolocation.getCurrentPosition({timeout: 20000, enableHighAccuracy: true}).then(function(data) {
        $scope.currentLocation = {
            lat: data.coords.latitude,
            lng: data.coords.longitude
        };

        function getDistance(location) {
            var r = Math.ceil(geolib.getDistance({
                    latitude: $scope.currentLocation.lat,
                    longitude: $scope.currentLocation.lng
                }, {
                    latitude: location[1],
                    longitude: location[0]
                })/100)*100;
            if (r>=1000) {
                return r/1000 + "km";
            }
            else {
                return r + "m";
            }
        }


        map = lingerAPI.chat.query({ latitude: $scope.currentLocation.lat, longitude: $scope.currentLocation.lng }, function() {
            $scope.map = _.map(map, function(obj) {
                return _.extend(obj, {
                    distance: getDistance(obj.location),
                    points: obj.points && _.map(obj.points, function(p) {
                        return _.extend(p, {
                            distance: getDistance(obj.location)
                        });
                    })
                });
            });
        });

    }, function handleGeoLocationError(err) {
        alert(JSON.stringify(err))
    });

    $scope.goCreate = function() {
        $state.go("main.create");
    };

}]);



