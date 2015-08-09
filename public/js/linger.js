angular.module("linger", [ "ngMap", "ui.router", "linger.services", "linger.controllers", "linger.directives" ])
    .config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/admin");
        $stateProvider
            .state("map", {
                    url: "/map",
                controller: "MapViewController",
                templateUrl: "html/map-view.html"
            })
            .state("admin", {
                url: "/admin",
                controller: "AdminController",
                templateUrl: "html/admin.html"
            })
            .state("test", {
                url: "/test",
                controller: "TestController",
                templateUrl: "html/test.html"
            });
    }])
    .controller("Main", ["$scope", function($scope) {
        $scope.currentTab = "explore";
        $scope.selectTab = function(tab) {
            $scope.currentTab = tab;
        }
    }]);
angular.module("linger.services", [ "ngResource", "btford.socket-io" ]);
angular.module("linger.controllers", [ "geolocation" ]);
angular.module("linger.directives", [ "hmTouchEvents" ]);