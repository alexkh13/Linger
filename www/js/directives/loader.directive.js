angular.module("linger.directives").directive("loader", [ "$compile", function($compile) {
    return {
        link: function(scope, element, attrs) {
            var ld = angular.element("<div>");
            ld.addClass("loader-content");
            ld.append($compile("<table width='100%' height='100%'><tr><td width='100%' height='100%' align='center' valign='middle'>" +
                "<md-progress-circular md-mode='indeterminate'></td></tr></table>")(scope));
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