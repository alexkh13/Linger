angular.module("linger.controllers").controller("TestController", [ "$scope", function ($scope) {

    var rr = 40;
    var dd = 50;

    var canvas = $("canvas")[0];
    var context = canvas.getContext('2d');

    function resize() {
        canvas.width = $(window).width();
        canvas.height = $(window).height();
        draw();
    }

    function intersection(x0, y0, r0, x1, y1, r1) {
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
    }

    function draw() {

        var r = 10;

        var r_style = { fillStyle: 'red', strokeStyle: '#444' };

        function circle(point, radius, style) {
            context.beginPath();
            context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
            if(style.fillStyle) {
                context.fillStyle = style.fillStyle;
                context.fill();
            }
            context.lineWidth = 1;
            context.strokeStyle = style.strokeStyle;
            context.stroke();
        }

        var center = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };

        function getPoints(center, count) {

            var i = 1, result = [];

            while(result.length < count) {

                var radius = rr*i++;
                var c = Math.floor(Math.PI * radius / dd);
                var d = Math.PI * radius / c;
                var a = Math.floor(Math.random() * dd) + 1;

                var start = intersection(center.x, center.y, radius, center.x + a, center.y, radius)[0];
                var end = intersection(center.x, center.y, radius, center.x - a, center.y, radius)[0];


                result.push(start, end);

                for(var j=1;j<c;j++) {
                    var sd = 2*radius*Math.sin(d*j/radius/2);
                    var points = intersection(center.x, center.y, radius, start.x, start.y, sd);
                    if(points) {
                        result = result.concat(points);
                    }
                }
            }

            return result;

        }

        var points = getPoints(center, 5);

        angular.forEach(points, function(point) {
            circle(point, r, r_style);
        });


    }

    $(window).on("resize", resize).trigger("resize");

}]);



