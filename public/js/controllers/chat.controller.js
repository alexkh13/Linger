angular.module("linger.controllers").controller("ChatController", [ "$scope", "$stateParams", "$timeout","lingerAPI", function ($scope, $stateParams, $timeout, lingerAPI) {
    $scope.id = $stateParams.thread;






    map = lingerAPI.geo.query({ latitude: $scope.currentLocation.lat, longitude: $scope.currentLocation.lng }, function() {
        $scope.map = _.map(map, function(obj) {
            return _.extend(obj, {
                distance: getDistance(obj.location),
                points: obj.points && _.map(obj.points, function(p) {
                    return _.extend(p, {
                        distance: getDistance(obj.location)
                    });
                })
            });
        });
    });

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

    var answers = [
        {
            image: 2,
            owner: "Maria Hopkins",
            content: "תספר לי על זה :(",
            time: "18:37"
        }
    ];

    $(".chat-input").on("keydown", function(ev) {
        if(ev.keyCode ==13 ) {
            $scope.$apply($scope.send);
        }
    });

}]);



