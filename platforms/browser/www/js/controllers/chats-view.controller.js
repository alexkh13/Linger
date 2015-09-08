angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state","lingerAPI","UserService","$cordovaGeolocation","notificationsManager","lingerSocket", function ($scope, $state, lingerAPI,UserService,$cordovaGeolocation,notificationsManager,lingerSocket) {

    function refresh() {
        // Get all user groups{
        var clusters = lingerAPI.chat.query({
            "latitude": $scope.currentLocation.lat,
            "longitude": $scope.currentLocation.lng
        }, function() {
            $scope.chats = _.flatten(_.pluck(clusters, "points"));

        });
    }

    $scope.MQ = notificationsManager.GetMQ();

    $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false}).then(function(data) {



        $scope.currentLocation = {
            lat: data.coords.latitude,
            lng: data.coords.longitude
        };

        refresh();

    },function(err)
      {
          console.log(err);
      });

    $scope.$on("refreshMap", refresh);


    //$scope.chats = [
    //    {
    //        image: 1,
    //        name: "test group",
    //        group: true
    //    },


    $scope.go = function(data) {
        $state.go("main.chat", {
            id: data._id
        });
    }
}]);



