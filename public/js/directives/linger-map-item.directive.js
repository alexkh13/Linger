angular.module("linger.directives").directive("lingerMapItem", [ function() {
    return {
        scope: {
            item: "="
        },
        link: function(scope, element, attrs) {

            scope.$emit("lingerMapItemCreate", scope.item);

            scope.$on("$destroy", function() {
                scope.$emit("lingerMapItemDestroy", scope.item)
            });
        }
    }
}]);