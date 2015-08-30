angular.module("linger.directives").directive("highlightSlider", [ "$timeout", function($timeout) {

    return {
        scope: true,
        link: function(scope, element, attrs) {
            scope.$on("slide", function(s, index) {
                element.css("transform", "translateX(" + (element.outerWidth() * index) + "px)");
            });
        }
    }
}]);