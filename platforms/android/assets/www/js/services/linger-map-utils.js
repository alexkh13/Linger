angular.module("linger.services").factory("MapUtils", [ "$q", function($q) {

    var utils = {
        geoToPixel: function (location, offset) {
            var zoom = 256 << 15;
            return {
                x: Math.round(zoom + (location.lng * zoom / 180)) + ( offset ? offset.x : 0 ),
                y: Math.round(zoom - zoom/Math.PI * Math.log((1 + Math.sin(location.lat * Math.PI / 180)) / (1 - Math.sin(location.lat * Math.PI / 180))) / 2) + ( offset ? offset.y : 0 )
            }
        },
        collide: function(a, b) {
            return a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y;
        },
        intersection: function (x0, y0, r0, x1, y1, r1) {
            var a, dx, dy, d, h, rx, ry;
            var x2, y2;

            /* dx and dy are the vertical and horizontal distances between
             * the circle centers.
             */
            dx = x1 - x0;
            dy = y1 - y0;

            /* Determine the straight-line distance between the centers. */
            d = Math.sqrt((dy*dy) + (dx*dx));

            /* Check for solvability. */
            if (d > (r0 + r1)) {
                /* no solution. circles do not intersect. */
                return false;
            }
            if (d < Math.abs(r0 - r1)) {
                /* no solution. one circle is contained in the other */
                return false;
            }

            /* 'point 2' is the point where the line through the circle
             * intersection points crosses the line between the circle
             * centers.
             */

            /* Determine the distance from point 0 to point 2. */
            a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

            /* Determine the coordinates of point 2. */
            x2 = x0 + (dx * a/d);
            y2 = y0 + (dy * a/d);

            /* Determine the distance from point 2 to either of the
             * intersection points.
             */
            h = Math.sqrt((r0*r0) - (a*a));

            /* Now determine the offsets of the intersection points from
             * point 2.
             */
            rx = -dy * (h/d);
            ry = dx * (h/d);

            /* Determine the absolute intersection points. */
            var xi = x2 + rx;
            var xi_prime = x2 - rx;
            var yi = y2 + ry;
            var yi_prime = y2 - ry;

            return [
                {x: xi, y: yi},
                {x: xi_prime, y: yi_prime}
            ]
        },
        getDistributedPoints: function (center, count) {

            var rr = 80, dd = 100, i = 1, result = [];

            while(result.length < count) {

                var radius = rr*i++;
                var c = Math.floor(Math.PI * radius / dd);
                var d = Math.PI * radius / c;
                var a = Math.floor(Math.random() * dd) + 1;

                var start = utils.intersection(center.x, center.y, radius, center.x + a, center.y, radius)[0];
                var end = utils.intersection(center.x, center.y, radius, center.x - a, center.y, radius)[0];


                result.push(start, end);

                for(var j=1;j<c;j++) {
                    var sd = 2*radius*Math.sin(d*j/radius/2);
                    var points = utils.intersection(center.x, center.y, radius, start.x, start.y, sd);
                    if(points) {
                        result = result.concat(points);
                    }
                }
            }

            return result;

        },
        distance: function(p1, p2) {
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        isOn: function(a, b, c) {
            return utils.distance(a,c) + utils.distance(c,b) == utils.distance(a,b);
        },
        getIntersections: function(a, b, c, r) {
            // Calculate the euclidean distance between a & b
            var eDistAtoB = Math.sqrt( Math.pow(b.x- a.x, 2) + Math.pow(b.y- a.y, 2) );

            // compute the direction vector d from a to b
            var d = { x: (b.x- a.x)/eDistAtoB, y: (b.y- a.y)/eDistAtoB };

            // Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.

            // compute the value t of the closest point to the circle center (cx, cy)
            var t = (d.x * (c.x- a.x)) + (d.y * (c.y- a.y));

            // compute the coordinates of the point e on line and closest to c
            var e = {coords:{}, onLine:false};
            e.coords.x = (t * d.x) + a.x;
            e.coords.y = (t * d.y) + a.y;

            // Calculate the euclidean distance between c & e
            var eDistCtoE = Math.sqrt( Math.pow(e.coords.x- c.x, 2) + Math.pow(e.coords.y- c.y, 2) );

            // test if the line intersects the circle
            if( eDistCtoE < r ) {
                // compute distance from t to circle intersection point
                var dt = Math.sqrt( Math.pow(r, 2) - Math.pow(eDistCtoE, 2));

                // compute first intersection point
                var f = {coords:{}, onLine:false};
                f.coords.x = ((t-dt) * d.x) + a.x;
                f.coords.y = ((t-dt) * d.y) + a.y;
                // check if f lies on the line
                f.onLine = utils.isOn(a, b, f.coords);

                // compute second intersection point
                var g = {coords:{}, onLine:false};
                g.coords.x = ((t+dt) * d.x) + a.x;
                g.coords.y = ((t+dt) * d.y) + a.y;
                // check if g lies on the line
                g.onLine = utils.isOn(a, b, g.coords);

                return [f.coords, g.coords ];

            } else if (parseInt(eDistCtoE) === parseInt(r)) {
                // console.log("Only one intersection");
                return [];
            } else {
                // console.log("No intersection");
                return [];
            }
        }
    };

    return utils;
}]);