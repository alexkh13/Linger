angular.module("linger.controllers").controller("AdminController", [ "$scope", "lingerSocket", function ($scope, lingerSocket) {

    $scope.markers = [];

    $scope.addMarker = function(evt) {
        var loc = {
            lat: evt.latLng.lat(),
            lng: evt.latLng.lng()
        };
        console.log(loc);
        lingerSocket.emit("markers:create", loc);
        $scope.markers.push(loc);
    }

}]);



