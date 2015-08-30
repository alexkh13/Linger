angular.module("linger.services").factory("lingerSocket", [ "socketFactory", function(socketFactory) {
    return socketFactory({
        prefix: ''
    });
}]);