angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
        geo: $resource("/api/chat/:longitude/:latitude"),
        auth: $resource("/api/auth", null, {
            getUser: {
                method: "GET",
                isArray: false
            }
        }),
        chat: $resource("/api/chat/:msgdata")
    }
}]);