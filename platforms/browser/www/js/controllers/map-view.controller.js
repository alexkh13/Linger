angular.module("linger.controllers").controller("MapViewController", [ "$scope", "$state", "$timeout", "lingerSocket", "lingerAPI", "$cordovaGeolocation", function ($scope, $state, $timeout, lingerSocket, lingerAPI, $cordovaGeolocation) {

    var map = $scope.map = [];

    lingerSocket.on("markers:created", function(obj) {
        map.push(obj);
    });

    lingerSocket.on("markers:initialize", function(data) {
        angular.forEach(data, function(obj) {
            map.push(obj);
        })
    });

    $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false}).then(function(data) {
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


        map = lingerAPI.geo.query({ latitude: $scope.currentLocation.lat, longitude: $scope.currentLocation.lng }, function() {
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

    });

    $scope.goCreate = function() {
        $state.go("main.create");
    };

}]);



