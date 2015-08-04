angular.module("linger.services").factory("MapUtils", [ function() {

    return {
        geoToPixel: function (location, offset) {
            var zoom = 256 << 15;
            return {
                x: Math.round(zoom + (location.lng * zoom / 180)) + ( offset ? offset.x : 0 ),
                y: Math.round(zoom - zoom/Math.PI * Math.log((1 + Math.sin(location.lat * Math.PI / 180)) / (1 - Math.sin(location.lat * Math.PI / 180))) / 2) + ( offset ? offset.y : 0 )
            }
        }
    }
}]);