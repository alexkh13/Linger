angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state","userService","chatAPI","lingerAPI", function ($scope, $state, userService,lingerAPI, chatAPI) {

    var uid =  userService.GetUserId();
 $scope.chats = chatAPI.chat.query({userid: uid}, function(){});

    $scope.chats = [
        { name: "test1" , id:"1"},
        { name: "test2" , id:"2"},
        { name: "test3" , id:"3"},
        { name: "test4" , id:"4"},
        { name: "test5" , id:"5"},
        { name: "test6" , id:"6"},
        { name: "test6" , id:"7"},
        { name: "test1" , id:"8"},
        { name: "test2" , id:"9"},
        { name: "test3" , id:"10"},
        { name: "test4" , id:"11"},
        { name: "test5" , id:"12"},
        { name: "test6" , id:"13"},
        { name: "test6" , id:"14"}
    ];

    $scope.go = function(roomnum) {

        userService.setRoomNum(roomnum);
        $state.go("chat");
    }

}]);



