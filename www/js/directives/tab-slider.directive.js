angular.module("linger.directives").directive("tabSlider", [ "$timeout", function($timeout) {

    return {
        scope: true,
        link: function(scope, element, attrs) {
            scope.$on("slide", function(s, index) {
                element.css("transform", "translateX(" + -(element.width() * index) + "px)");
            });
        }
    }
}]);