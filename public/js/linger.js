angular.module("linger", [ "ngAnimate", "ngMap", "ui.router", "ui.bootstrap", "linger.services", "linger.controllers", "linger.directives" ])
    .run([ "$rootScope", function($rootScope) {
        $rootScope.goBack = function() {
            window.history.back();
        };
    }])
    .config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("main", {
                url: "/",
                templateUrl: "html/main.html",
                controller: "Main"
            })
            .state("main.chat", {
                url: "chat",
                templateUrl: "html/chat.html",
                controller: "ChatController"
            })
    }])
    .controller("Main", ["$scope", "$timeout", "$http", "$state", function($scope, $timeout, $http, $state) {

        var tabs = {
            "chats": 0,
            "explore": 1,
            "friends": 2
        };

        $scope.selectTab = function(tab) {
            $scope.currentTab = tab;
            $scope.$broadcast("slide", tabs[tab]);
        };

        $scope.$on("showDropDown", function() {
            $scope.showDropDownPopup =  true;
        });

    }]);
angular.module("linger.services", [ "ngResource", "btford.socket-io" ]);
angular.module("linger.controllers", [ "geolocation" ]);
angular.module("linger.directives", [ "hmTouchEvents" ]);