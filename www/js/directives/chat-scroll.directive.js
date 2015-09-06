angular.module("linger.directives").directive("chatScroll", [ "$timeout", function($timeout) {
    return {
        scope: true,
        templateUrl: "html/chat-scroll.directive.html",
        link: function(scope, element, attrs) {
            function scrollToBottom() {
                $(element).scrollTop($(element)[0].scrollHeight);
            }

            scope.$on("scrollToBottom", function(s, force) {
                if(force || element[0].scrollHeight == element.scrollTop() + element.height()) {
                    $timeout(scrollToBottom);
                }
            });
        }
    }
}]);