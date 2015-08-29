angular.module("linger.directives").directive("autoDirection", [ "$timeout", function($timeout) {
    return {
        scope: true,
        templateUrl: "html/chat-scroll.directive.html",
        link: function(scope, element, attrs) {
            function isUnicode(str) {
                var letters = [];
                for (var i = 0; i <= str.length; i++) {
                    letters[i] = str.substring((i - 1), i);
                    if (letters[i].charCodeAt() > 255) { return true; }
                }
                return false;
            }
            var dir = $(element);
            dir.keyup(function(e) {
                if (isUnicode(dir.val())) {
                    $(this).css('direction', 'rtl');
                }
                else {
                    $(this).css('direction', 'ltr');
                }
            });
        }
    }
}]);