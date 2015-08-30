angular.module("linger.controllers").controller("FriendsViewController", [ "$scope", "$q", "$http", "$state", "lingerAPI", function ($scope, $q, $http, $state, lingerAPI) {

    var dummy = [];
    dummy.length = 10;

    var promises = _.map(dummy, function() {
        return $http.get("https://randomuser.me/api/");
    });

    $q.all(promises).then(function(results) {
        $scope.friends = _.map(results,function(obj) {
            return obj.data.results[0].user
        });
        lingerAPI.friends = _.indexBy($scope.friends, "registered");
    });

    $scope.go = function(profile) {
        $state.go("main.profile", {
            id: profile.registered
        })
    }

}]);

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};