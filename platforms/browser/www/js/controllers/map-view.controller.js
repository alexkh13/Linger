angular.module("linger.controllers").controller("MapViewController", [ "$scope", "$http", "$state", "$timeout", "lingerSocket", "lingerAPI", "$cordovaGeolocation", "$mdDialog", function ($scope, $http, $state, $timeout, lingerSocket, lingerAPI, $cordovaGeolocation, $mdDialog) {

    var map = $scope.map = [];

    function stopSearching() {
        $scope.searchingGPS = false;
    }
    $scope.searchingGPS = true;

    function refreshMap() {

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
    }

    function getLoaction() {
        $cordovaGeolocation.getCurrentPosition({timeout: 20000, enableHighAccuracy: true}).then(function(data) {
            $scope.currentLocation = {
                lat: data.coords.latitude,
                lng: data.coords.longitude
            };

            refreshMap();

            stopSearching();

        }, function handleGeoLocationError(err) {

            var message = (function() { switch(err.code) {
                case 1: return "Please allow GPS permissions for the application.";
                case 2: return "Please turn on GPS.";
                case 3: return "Can't determine location.";
            }})();

            var alert = $mdDialog.alert({
                title: 'GPS Problem',
                content: message,
                ok: 'Try Again'
            });
            $mdDialog
                .show( alert )
                .finally(function() {
                    alert = undefined;
                    $timeout(getLoaction);
                });
        });
    }

    getLoaction();

    $scope.$on("refreshMap", refreshMap);

    $scope.goCreate = function() {
        $state.go("main.create");
    };

}]);



