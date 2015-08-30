angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
        geo: $resource("http://10.0.0.3:3000/api/chat/:longitude/:latitude"),
        auth: $resource("http://10.0.0.3:3000/api/auth/:type", null, {
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