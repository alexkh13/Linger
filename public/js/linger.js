angular.module("linger", [ "ngMap", "ui.router", "linger.services", "linger.controllers", "linger.directives" ])
    .config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/map");
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
            });
    }]);
angular.module("linger.services", [ "btford.socket-io" ]);
angular.module("linger.controllers", []);
angular.module("linger.directives", [ "hmTouchEvents" ]);