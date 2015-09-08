angular.module("linger", [ "restangular", "ngMaterial", "ngCordova", "ngAnimate", "ngMap", "ui.router", "ui.bootstrap", "linger.services", "linger.controllers", "linger.directives" ])
    .run([ "$rootScope", "$window", "$state", function($rootScope, $window, $state) {
        $rootScope.goBack = function() {
            $window.history.back();
        };
        $rootScope.refreshMap = function() {
            $rootScope.$broadcast("refreshMap");
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
        RestangularProvider.setBaseUrl(BACKEND_SERVER_URL + "api");

        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("login", {
                url: "/login",
                templateUrl: "html/login.html",
                controller: "LoginController"
            })
            .state("registration", {
                url: "/register",
                templateUrl: "html/registration.html",
                controller: "RegistrationController"
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
    .controller("Main", ["$scope", "$state", "$cordovaBarcodeScanner", "$cordovaPrinter", "$mdDialog", function($scope, $state, $cordovaBarcodeScanner, $cordovaPrinter, $mdDialog) {

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

        $scope.scanQR = function() {
            $cordovaBarcodeScanner
                .scan()
                .then(function(barcodeData) {
                    if (barcodeData.format == "QR_CODE") {
                        var id = barcodeData.text.split('/').pop();
                        if (id && id.length == 24) {
                            $state.go("main.chat", {
                                id: id
                            });
                            return;
                        }
                    }

                    var alert = $mdDialog.alert({
                        title: 'QR Error',
                        content: "Not a valid group QR code.",
                        ok: 'Close'
                    });
                    $mdDialog
                        .show( alert )
                        .finally(function() {
                            alert = undefined;
                        });

                }, function(error) {
                    // An error occurred
                });
        };

        $scope.isChat = function() {
            return $state.is("main.chat");
        };

        $scope.newGroup = function() {
            $state.go("main.create");
        };

        $scope.showQR = function(ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'html/qr.dialog.html',
                targetEvent: ev,
                clickOutsideToClose:true
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogController($scope, $mdDialog) {
            $scope.groupId = document.location.hash.split('/').pop();
            $scope.printerAvail = $cordovaPrinter.isAvailable();
            $scope.print = function () {
                $cordovaPrinter.print("hello world");
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

        }

    }]);
angular.module("linger.services", [ "ngResource", "btford.socket-io", "LocalStorageModule" ]);
angular.module("linger.controllers", [ "geolocation" ]);
angular.module("linger.directives", [ "hmTouchEvents" ]);