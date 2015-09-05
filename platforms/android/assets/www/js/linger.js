angular.module("linger", [ "restangular", "ngMaterial", "ngCordova", "ngAnimate", "ngMap", "ui.router", "ui.bootstrap", "linger.services", "linger.controllers", "linger.directives" ])
    .run([ "$rootScope", "$window", "$state", function($rootScope, $window, $state) {
        $rootScope.goBack = function() {
            $window.history.back();
        };
        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error){
                if(error.status == 401){
                    $state.go("login", null, {
                        location: "replace"
                    });
                }
                else {
                    $rootScope.fetalError = error;
                }
            });
    }])
    .config([ "$httpProvider", "$stateProvider", "$urlRouterProvider", "$cordovaFacebookProvider", "$mdThemingProvider", "RestangularProvider", function($httpProvider, $stateProvider, $urlRouterProvider, $cordovaFacebookProvider, $mdThemingProvider, RestangularProvider) {
        $.support.cors=true;

        $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('red');

        window.fbAsyncInit = function() {
            if (cordova.platformId === 'browser') {
                $cordovaFacebookProvider.browserInit(FACEBOOK_APP_ID, FACEBOOK_API_VER);
            }
        };
        RestangularProvider.setBaseUrl("/api");

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
                    login: [ "$q", "$timeout", "lingerAPI", "$state", "UserService", function($q, $timeout, lingerAPI, $state, UserService) {
                        var deferred = $q.defer();
                        document.addEventListener("deviceready", function () {
                            lingerAPI.auth.getUser(function(user) {
                                if(user._id) {
                                    UserService.setUser(user);
                                    deferred.resolve(user);
                                }
                                else {
                                    $state.go("login", null, {
                                        location: "replace"
                                    });
                                }
                            }, function(err) {
                                return deferred.reject(err);
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
            });

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
angular.module("linger.services", [ "ngResource", "btford.socket-io", "LocalStorageModule" ]);
angular.module("linger.controllers", [ "geolocation" ]);
angular.module("linger.directives", [ "hmTouchEvents" ]);