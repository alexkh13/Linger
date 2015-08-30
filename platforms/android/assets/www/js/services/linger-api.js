angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
        geo: $resource(BACKEND_SERVER_URL + "api/chat/:longitude/:latitude"),
        auth: $resource(BACKEND_SERVER_URL + "api/auth/:type", null, {
            getUser: {
                method: "GET",
                isArray: false
            },
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