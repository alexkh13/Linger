angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
        geo: $resource("/api/chat/:longitude/:latitude"),
        auth: $resource("/api/auth/:type", null, {
            facebookLogin: {
                method: "POST",
                isArray: false,
                params: {
                    type: "facebook"
                }
            }
        }),
        chat: $resource("/api/chat/:msgdata")
    }
}]);