angular.module("linger.controllers").controller("ProfileController", [ "$scope", "$stateParams", "$state", "lingerAPI", function ($scope, $stateParams, $state, lingerAPI) {

    $scope.profile = lingerAPI.friends[$stateParams.id];

    $scope.groups = [
        { name: "סיבוכיות" },
        { name: "חישוביות" },
        { name: "אלגוריתמים" },
        { name: "מערכות בסיסי נתונים" },
        { name: "מבני נתונים" },
        { name: "פיתוח יישומי אינטרנט" },
        { name: "מערכות הפעלה" },
        { name: "הנדסת תוכנה מכוונת עצמים" },
        { name: "אבטחת יישומי אינטרנט" },
        { name:  "אינטרנט ושפת ג'אווה" },
        { name: "טכנולוגיות ווב ומובייל מתקדמות" },
        { name: "טכנולוגיה של ביג דאטה" },
        { name: "חיים מראות המבריק" },
        { name: "עובד ובניו פגושים" }
    ];

    $scope.go = function(group) {
        $state.go("main.chat", {
            id: group.name
        })
    }

}]);



