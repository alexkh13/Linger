angular.module("linger", [ "ngAnimate", "ngMap", "ui.router", "ui.bootstrap", "linger.services", "linger.controllers", "linger.directives" ])
    .service('userService', function() {
        this.userData = {roomnum: 0, userid:0};

        this.user = function() {
            return this.userData;
        };

        this.setRoomNum = function(roomNumber) {
            this.userData.roomnum = roomNumber;
        };

        this.GetRoomNum = function() {
            return this.userData.roomnum;
        };

        // Temporary until Facebook is implemented
        this.setUserID = function(newuserid) {
            this.userData.userid = newuserid;
        };

        this.GetUserId = function(){
          return this.userData.userid;
        };
    })
    .run([ "$rootScope", function($rootScope) {
        //It is executed after all of the services have been configured and the injector has been created


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
            /*.state("main.chat", {
                url: "chat",
                templateUrl: "html/chat.html",
                controller: "ChatController"
            })*/.state("chat", {
                url: "/chat",
                controller: "chatController",
                templateUrl: "html/chat.html"
            });
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