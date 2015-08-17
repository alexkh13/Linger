angular.module("linger.controllers").controller("FriendsViewController", [ "$scope", "$q", "$http", "lingerAPI", "geolocation", function ($scope, $q, $http, lingerAPI, geolocation) {


    var dummy = [];
    dummy.length = 50;

    var promises = _.map(dummy, function() {
        return $http.get("https://randomuser.me/api/");
    });

    $q.all(promises).then(function(results) {
        $scope.friends = _.map(results,function(obj) {
            return obj.data.results[0].user
        });
    });

}]);

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};