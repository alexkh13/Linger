angular.module("linger.controllers").controller("CreateController", [ "$scope", "$state", "lingerSocket", "$http", "$cordovaGeolocation", "$cordovaCamera", "$mdDialog", function ($scope, $state, lingerSocket, $http, $cordovaGeolocation, $cordovaCamera, $mdDialog) {

    $scope.locMode = "predefined";
    $scope.privateAdd = "everyone";

    var imageData;
    var currentLocation;

    $scope.locationLoading = true;

    $scope.users = {};

    $cordovaGeolocation.getCurrentPosition({timeout: 20000, enableHighAccuracy: true}).then(function(data) {

        currentLocation = {
            latitude: data.coords.latitude,
            longitude: data.coords.longitude
        };

        $http.get(BACKEND_SERVER_URL + "api/map/lookup/" + currentLocation.latitude + "/" + currentLocation.longitude).then(function (result) {
            $scope.locations = _.sortBy(_.map(result.data, function (obj) {
                return _.extend(obj, {
                    distance: geolib.getDistance(currentLocation, {
                        latitude: obj.location.lat,
                        longitude: obj.location.lng
                    })
                })
            }), "distance");
            if($scope.locations.length) {
                $scope.customClusterName = $scope.predefinedClusterName = $scope.locations[0].name;
                if($scope.locations[0].type == "cluster") {
                    $scope.locDisabled = true;
                    $scope.locMode = "custom";
                }
            }


            $scope.locationLoading = false;
        });

    });

    $scope.predefinedChanged = function() {
        $scope.customClusterName = $scope.predefinedClusterName;
    }

    $scope.choosePicture = function() {
        var options = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            targetHeight: 200,
            targetWidth: 200
        };

        $cordovaCamera.getPicture(options).then(function(data) {

            $scope.groupImage = "data:image/jpeg;base64," + (imageData = data);
        }, function(err) {
            alert(err);
        });
    };

    $scope.createGroup = function() {
        if(!$scope.groupName) return;
        $scope.creatingGroup = true;
        var data = {
            location: currentLocation,
            groupName: $scope.groupName,
            clusterName: $scope.locMode == "predefined" ? $scope.predefinedClusterName : $scope.customClusterName,
            isPrivate: $scope.isPrivate,
            image: imageData
        };
        $http.post(BACKEND_SERVER_URL + "api/chat", data).then(function (result) {
            $scope.refreshMap();
            lingerSocket.emit("subscribe", { room: result.data._id });
            $state.go("main.chat", { id: result.data._id}, { location: "replace" });
        });
    };


    $scope.showWhy = function() {
        var alert = $mdDialog.alert({
            title: 'Unfortunately,',
            content: 'Someone already created a group in your location. Multiple names for the same location isn\'t supported at this moment.',
            ok: 'Got it!'
        });
        $mdDialog
            .show( alert )
            .finally(function() {
                alert = undefined;
            });
    }

}]);

