angular.module("linger.controllers").controller("AdminController", [ "$scope", "$timeout", "lingerSocket", "lingerAPI", function ($scope, $timeout, lingerSocket, lingerAPI) {

    var all = [];

    $scope.mode = "add";

    $scope.$watch("mode", function() {
        $scope.result = null;
        $scope.markers = angular.copy(all);
    });

    $scope.click = function(evt) {
        var loc = {
            longitude: evt.latLng.lng(),
            latitude: evt.latLng.lat()
        };
        switch($scope.mode) {
            case "add":
                lingerAPI.geo.save(loc);
                break;
            case "query":
                lingerAPI.geo.query(loc, function(data) {
                    var ids = _.pluck(data, "_id");
                    $scope.markers = _.filter(all, function(obj) {
                        return !_.contains(ids, obj._id);
                    });
                    $scope.result = data;
                });

        }
    };

    lingerSocket.on("markers:created", function(data) {
        if($scope.markers[data._id]) {
            delete $scope.markers[data._id];
        }
        $timeout(function() {
            $scope.markers[data._id] = all[data._id] = data;
            if(data.type == "cluster") {
                angular.forEach(data.points, function(obj) {
                    $scope.children[obj._id] = obj;
                    delete $scope.markers[obj._id];
                    delete all[obj._id];
                });
            }
        });
    });

    var geoItems = lingerAPI.geo.query(function() {
        $scope.markers = _.indexBy(geoItems, "_id");
        $scope.children = _.indexBy(_.compact(_.flatten(_.map(geoItems, function(item) {
            return item.points;
        }))), "_id");
        all = angular.copy($scope.markers);
    });

}]);



