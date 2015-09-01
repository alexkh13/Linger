angular.module("linger", [ "ngCordova", "ngAnimate", "ngMap", "ui.router", "ui.bootstrap", "linger.services", "linger.controllers", "linger.directives" ])
    .run([ "$rootScope", "$window", function($rootScope, $window) {
        $rootScope.goBack = function() {
            $window.history.back();
        };
    }])
    .config([ "$stateProvider", "$urlRouterProvider", "$cordovaFacebookProvider", function($stateProvider, $urlRouterProvider, $cordovaFacebookProvider) {
        $.support.cors=true;

        window.fbAsyncInit = function() {
            if (cordova.platformId === 'browser') {
                $cordovaFacebookProvider.browserInit(FACEBOOK_APP_ID, FACEBOOK_API_VER);
            }
        };

        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("login", {
                url: "/login",
                templateUrl: "html/login.html",
                controller: "LoginController"
            })
            .state("main", {
                url: "/",
                templateUrl: "html/main.html",
                controller: "Main",
                resolve: {
                    login: [ "$q", "$timeout", "lingerAPI", "$state", function($q, $timeout, lingerAPI, $state) {
                        var deferred = $q.defer();
                        document.addEventListener("deviceready", function () {
                            lingerAPI.auth.getUser(function(user) {
                                if(user._id) {
                                    deferred.resolve(user);
                                }
                                else {
                                    $state.go("login", null, {
                                        location: "replace"
                                    });
                                }
                            }, function(err) {
                                alert(JSON.stringify(err));
                            });
                        });
                        return deferred.promise;
                    }]
                }
            })
            .state("main.chat", {
                url: "chat/:id",
                templateUrl: "html/chat.html",
                controller: "ChatController"
            })
            .state("main.profile", {
                url: "profile/:id",
                templateUrl: "html/profile.html",
                controller: "ProfileController"
            })
            .state("main.create", {
                url: "create",
                templateUrl: "html/create.html",
                controller: "CreateController"
            })
    }])
    .controller("Main", ["$scope", function($scope) {

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