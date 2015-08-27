angular.module("linger.services").factory("chatAPI", [ "$resource", function($resource) {
    var items = [];

    return {
        chat: $resource("/chatAPI/:userid")
    }
}]);
