angular.module("linger.controllers").controller("ChatsViewController", [ "$scope", "$state", function ($scope, $state) {

    $scope.chats = [
        {
            name: "סיבוכיות",
            group: true,
            count: 21,
            friends: 4,
            messages: 6,
            lastMessage: "אתם יודעים אולי איפה אפשר..."
        },
        {
            name: "טכנולוגיות ווב ומובייל מתקדמות",
            group: true,
            count: 15,
            friends: 2,
            lastMessage: "הקורס הזה מזה מעיק הסמסטר"
        },
        {
            name: "Maya Schmidt",
            group: false,
            image: 6,
            messages: 1,
            lastMessage: "גם אני!"
        },
        {
            name: "מערכות הפעלה",
            group: true,
            suggestion: true,
            count: 32
        },
        {
            name: "Maria Hopkins",
            group: false,
            image: 2
        },
        {
            name: "Adam Sandler",
            group: false,
            image: 1
        },
        {
            name: "Michael Gregoire",
            group: false,
            image: 3
        },
        {
            name: "אלגוריתמים",
            group: true,
            suggestion: true,
            count: 3
        },
        {
            name: "אמנון דקל",
            group: false,
            image: 5
        }
    ];

    $scope.go = function(id) {
        if (id != "סיבוכיות") {
            $state.go("main.chat.conversation", {
                thread: "public",
                id: id
            });
        }
        else {
            $state.go("main.chat", {
                id: id
            });
        }
    }

}]);



