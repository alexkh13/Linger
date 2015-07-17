angular.module("linger.directives").directive("lingerMapItem", [ function() {
    return {
        scope: {
            location: "="
        },
        link: function(scope, element, attrs) {

            var bunnyTexture = PIXI.Texture.fromImage('/images/marker.png');

            var bunny = new PIXI.Sprite(bunnyTexture);

            bunny.scale.x = bunny.scale.y = 1 //getScale(bunny.position.x, bunny.position.y);

            scope.$emit("lingerMapItemCreate", {
                location: scope.location,
                sprite: bunny
            });

            scope.$on("$destroy", function() {
                scope.$emit("lingerMapItemDestroy", bunny)
            });
        }
    }
}]);