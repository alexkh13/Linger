angular.module("linger.services").factory("lingerAPI", [ "$resource", function($resource) {
    return {
    //"/api/chat?longitude=x&latitude=y""	//get all groups close to (x,y)
    //"/api/chat"	//create group
    //"/api/chat/:groupid"//	get group with id=:groupid
    //"/api/chat/:groupid/message"	//get last ? messages for group
    //                                                      /api/chat/:groupid/message/:timestamp	get last ? Before :timestamp
    ///api/chat/:groupid/message	send message to group

        chat: $resource(BACKEND_SERVER_URL + "api/chat"),
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
        group:$resource(BACKEND_SERVER_URL + "api/chat/groups/:groupid"),
        msg: $resource(BACKEND_SERVER_URL + "api/chat/:groupid/message/:timestamp"),
        users: $resource(BACKEND_SERVER_URL +  "api/user")
    }
}]);