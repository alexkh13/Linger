angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    var items = [];

    return {
        geo: $resource("/api/geo/:longitude/:latitude")
    }
}]);