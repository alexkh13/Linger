angular.module("linger.directives").directive("lingerMap", [ "Map", function(Map) {

    return {
        scope: {
            currentLocation: "="
        },
        transclude: true,
        replace: true,
        templateUrl: "html/linger-map/linger-map.directive.html",
        link: function(scope, element, attrs) {

            var map = new Map(element);

            function resize() {

                var w = $(element).width();
                var h = $(element).height();

                map.resize(w, h);
            }

            $(window).on("resize", resize);

            resize();

            scope.panstart = function() {
                //map.panStop();
            };

            scope.panend = function() {
                map.panStop();
            };

            scope.pan = function(ev) {
                map.pan({
                    x: ev.deltaX,
                    y: ev.deltaY
                });
            };

            scope.tap = function(ev) {
                map.tap({
                    x: ev.center.x,
                    y: ev.center.y - $(ev.target).offset().top
                });
            };

            //var pinching = false;
            //scope.pinchstart = function(ev) {
            //    pinching = true;
            //};
            //
            //scope.pinchend = function(ev) {
            //    pinching = false;
            //};
            //
            //scope.pinch = function(ev) {
            //    stopMove();
            //    for(var i=0; i<scope.items.length; i++) {
            //        var bunny = scope.items[i];
            //        bunny.sprite.scale.x = bunny.sprite.scale.y = bunny.sprite.scale.x + 0.1;
            //    }
            //};

            scope.$on("lingerMapItemCreate", function(context,  item) {
                map.add({
                    name: item.name,
                    location: { lng: item.location[0], lat: item.location[1] },
                    sub_points: _.map(item.points, function(point) {
                        return {
                            name: point.name,
                            image: point.image,
                            location: {
                                lng: point.location[0],
                                lat: point.location[1]
                            }
                        }
                    })
                });
            });

            scope.$watch("currentLocation", function(loc) {
                if(loc) {
                    map.setCurrentLocation(loc);
                }
            })

        }
    }
}]);