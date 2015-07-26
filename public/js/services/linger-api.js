angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
        geo: $resource("/api/geo/:longitude/:latitude")
    }
}]);