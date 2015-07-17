angular.module("linger.directives").directive("lingerMap", [ function() {

    function InitializeStage(element) {

        // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
        // which will try to choose the best renderer for the environment you are in.
        var renderer = new PIXI.autoDetectRenderer(800, 600);

        // The renderer will create a canvas element for you that you can then insert into the DOM.
        $(element)
            .append(renderer.view);

        function resize() {

            var w = $(window).width();
            var h = $(window).height();

            renderer.resize(w, h);
        }

        // You need to create a root container that will hold the scene you want to draw.
        var stage = new PIXI.Container();

        // kick off the animation loop (defined below)
        animate();

        function animate() {
            // start the timer for the next animation loop
            requestAnimationFrame(animate);

            // this is the main render call that makes pixi draw your container and its children.
            renderer.render(stage);
        }

        $(window).on("resize", resize);

        resize();

        return stage;
    }

    return {
        scope: true,
        transclude: true,
        templateUrl: "html/linger-map/linger-map.directive.html",
        link: function(scope, element, attrs) {

            var stage = InitializeStage(element.children(1));

            scope.items = [];

            function getScale(x, y) {
                var center = getCenter();
                var dx = center.x - x;
                var dy = center.y - y;
                var d = Math.sqrt(dx * dx + dy * dy);
                var p = 100 - (d * 100 / Math.max(center.x, center.y));
                return p / 100;
            }

            function getCenter() {
                return {
                    x: $(window).width() / 2,
                    y: $(window).height() / 2
                }
            }

            scope.panstart = function(ev) {
                for(var i=0; i<scope.items.length; i++) {
                    var bunny = scope.items[i];
                    bunny.start = {
                        x: bunny.sprite.position.x,
                        y: bunny.sprite.position.y
                    }
                }
            };

            function stopMove() {
                clearInterval(timeout);
                timeout = null;
            }

            var timeout;
            function moveTo(delta) {
                for(var i=0; i<scope.items.length; i++) {
                    var bunny = scope.items[i];
                    bunny.dest = {
                        x: bunny.start.x + delta.x,
                        y: bunny.start.y + delta.y
                    }
                }
                if(!timeout) {
                    timeout = setInterval(function() {
                        for(var i=0; i<scope.items.length; i++) {
                            var bunny = scope.items[i];
                            bunny.sprite.position.x += (bunny.dest.x - bunny.sprite.position.x) / 6;
                            bunny.sprite.position.y += (bunny.dest.y - bunny.sprite.position.y) / 6;
                            bunny.sprite.scale.x = bunny.sprite.scale.y = getScale(bunny.sprite.position.x, bunny.sprite.position.y);
                            if(!Math.floor(bunny.sprite.position.x - bunny.dest.x) && !Math.floor(bunny.sprite.position.y - bunny.dest.y)) {
                                stopMove();
                            }
                        }
                    }, 10);
                }
            }

            scope.pan = function(ev) {
                if(!pinching) {
                    moveTo({
                        x: ev.deltaX,
                        y: ev.deltaY
                    });
                }
            };

            var pinching = false;
            scope.pinchstart = function(ev) {
                pinching = true;
            };

            scope.pinchend = function(ev) {
                pinching = false;
            };

            scope.pinch = function(ev) {
                stopMove();
                for(var i=0; i<scope.items.length; i++) {
                    var bunny = scope.items[i];
                    bunny.sprite.scale.x = bunny.sprite.scale.y = bunny.sprite.scale.x + 0.1;
                }
            };

            function geoToPixel(location) {

                var MAP_WIDTH = $(window).width() * 100000;
                var MAP_HEIGHT = $(window).height() * 100000;

                return {
                    x: Math.round((location.lng + 180) * (MAP_WIDTH / 360)),
                    y: Math.round(((-1 * location.lat) + 90) * (MAP_HEIGHT / 180))
                }
            }

            scope.$on("lingerMapItemCreate", function(context,  item) {

                var CURRENT = geoToPixel({
                    lat: 32.08457441812832,
                    lng: 34.82314109802246
                });

                var position = geoToPixel(item.location);

                position.x -= CURRENT.x;
                position.y -= CURRENT.y;

                item.sprite.position = position;

                item.sprite.scale.x = item.sprite.scale.y = getScale(position.x, position.y);

                scope.items.push(item);

                stage.addChild(item.sprite);
            });

        }
    }
}]);