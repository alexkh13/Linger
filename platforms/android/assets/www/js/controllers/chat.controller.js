angular.module("linger.controllers").controller("ChatController", [ "$q", "$scope", "$state", "$stateParams", "$timeout", "lingerAPI", "$http", function ($q, $scope, $state, $stateParams, $timeout, lingerAPI, $http) {

    $scope.title = $stateParams.id;

    $scope.messages = [];
    var answers = [];

    if ($scope.title == "אלגוריתמים") {

        $scope.messages = [
            {
                image: 1,
                owner: "Dan Man",
                content: "מתי הפסקה?",
                time: "18:30"
            },
            {
                image: 2,
                owner: "Maria Hopkins",
                content: "באמת מתי?!?!? הוא מייבש אותנו פה....",
                time: "18:32"
            },
            {
                image: 3,
                owner: "Michael Gregoire",
                content: "וואיי לגמריי.. שמישהוש יגיד לו",
                time: "18:33"
            },
            {
                image: 4,
                owner: "Tamar Cohen",
                content: "יאללה בלאגן!",
                time: "18:34"
            },
            {
                image: 5,
                owner: "אמנון דקל",
                content: "חכו חכו זה תכף מגיע",
                time: "18:35"
            }
        ];

        answers = [
            {
                image: 2,
                owner: "Maria Hopkins",
                content: "תספר לי על זה :(",
                time: "18:37"
            }
        ];

    }
    else {
        answers = [
            {
                image: 2,
                owner: "Maria Hopkins",
                content: "Hey!",
                time: "18:37"
            }
        ];
    }

    $scope.send = function() {
        //$scope.messages.push({
        //    //me: true,
        //    //owner: "Alex Khmelnitsky",
        //    //content: $scope.message,
        //    //time: "18:37"
        //}
       // messages = lingerAPI.chat.query({msgstring:});

        var DBdata = {
            timestamp:date,
            message:data.msg,
            groupid:data.groupid
        };

        $timeout(function() {
            $scope.messages.push(answers.shift());
        }, 2000);
        $scope.message = "";
    };

    $(".chat-input").on("keydown", function(ev) {
        if(ev.keyCode ==13 ) {
            $scope.$apply($scope.send);
        }
    });

}]);



