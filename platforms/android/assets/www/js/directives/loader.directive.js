angular.module("linger.directives").directive("loader", [ "$compile", function($compile) {
    return {
        link: function(scope, element, attrs) {
            var ld = angular.element("<div>");
            ld.addClass("loader-content");
            ld.append($compile("<md-progress-circular md-mode='indeterminate'>")(scope));
            element.append(ld);
            ld.hide();
            scope.$watch(attrs.loader, function(value) {
                 if(value) {
                     ld.show();
                 }
                else {
                     ld.hide();
                }
            });
        }
    }
}]);