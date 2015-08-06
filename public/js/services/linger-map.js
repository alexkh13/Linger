angular.module("linger.services").factory("Map", [ "$timeout", "MapUtils", "MapItem", function($timeout, MapUtils, MapItem) {

    return function Map(element) {

        var stage = new PIXI.Container();
        var items = [];
        var resizeRan = false;
        var bgSprites = [];
        var currentExpended, expandTimeout;

        var ANCHOR = {
            x: undefined,
            y: undefined
        };

        var renderer = createRenderer(element, stage, animate);
        var centerView = new PIXI.Circle(0,0,0);

        function animate() {

            var i;

            if (ANCHOR) {
                for(i=0;i<items.length;i++) {
                    items[i].animate();
                    items[i].updatePosition();
                }
            }

            if (stage.dest) {
                var delta = {
                    x: (stage.dest.x - stage.position.x) / 10,
                    y: (stage.dest.y - stage.position.y) / 10
                };
                stage.position.x += delta.x;
                stage.position.y += delta.y;

                if (currentExpended) {

                    var pos = currentExpended.getPosition();
                    pos = { x: pos.x + stage.position.x, y: pos.y + stage.position.y };
                    var center = { x: renderer.width / 2, y: renderer.height /2 };
                    var distance = MapUtils.distance(center, pos);

                    if(distance > currentExpended.radius) {
                        collapseItem();
                    }
                }
            }
        }

        function collapseItem() {
            clearTimeout(expandTimeout);
            currentExpended.show();
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                if(item.child) {
                    item.moveTo(currentExpended.getPosition());
                }
                else {
                    item.revertPos();
                }
            }
            $timeout(function() {
                for(var i=0; i<items.length; i++) {
                    var item = items[i];
                    if(item.child) {
                        items[i].remove();
                        items.splice(i--, 1);
                    }
                }
            }, 1000);
            currentExpended = undefined;
        }

        this.setCurrentLocation = function(location) {
            angular.extend(ANCHOR, MapUtils.geoToPixel(location));

            for(var i=0; i<items.length; i++) {
                items[i].updatePosition();
            }
        };

        /**
         *
         * @param width
         * @param height
         */
        this.resize = function(width, height) {
            renderer.resize(width, height);
            var min = Math.min(width,height);
            centerView.radius = (min/2) - min*0.15;
            centerView.x = width / 2;
            centerView.y = height / 2;
            if(!resizeRan) {
                resizeRan = true;

                function addBgSprite(x, y) {
                    var backgroundGraphics = new PIXI.Graphics();

                    for(var i=4;i<50;i+=2) {
                        backgroundGraphics.lineStyle(i - 2, 0xffffff, 0.05);
                        backgroundGraphics.drawCircle(x, y, Math.pow(i, 2));
                    }

                    var texture = new PIXI.RenderTexture(renderer, 1000, 1000);
                    texture.render(backgroundGraphics);

                    var sprite = new PIXI.Sprite(texture);
                    sprite.position.x = (width / 2) - x;
                    sprite.position.y = (height / 2) - y;

                    bgSprites.push(sprite);
                    stage.addChild(sprite);
                }

                var bgTileSprite = new PIXI.extras.TilingSprite.fromImage("/images/bg.png", 2000, 2000);

                bgTileSprite.position.x = (width / 2) - 1000;
                bgTileSprite.position.y = (height / 2) - 1000;

                stage.addChild(bgTileSprite);
                bgSprites.push(bgTileSprite);

                addBgSprite(0 ,0);
                addBgSprite(1000,1000);
                addBgSprite(0,1000);
                addBgSprite(1000,0);

            }
        };

        /**
         *
         * @param point
         */
        this.add = function(point) {

            var item = new MapItem({
                location: point.location,
                children: point.sub_points,
                stage: stage,
                renderer: renderer,
                anchor: ANCHOR,
                mask: centerView,
                position: point.position,
                map: this,
                before: point.before
            });

            items.push(item);

            return item;

        };

        var panStarted;

        /**
         *
         * @param position
         */
        this.pan = function(position) {

            if(!panStarted) {
                panStarted = true;
                stage.start = {
                    x: stage.x,
                    y: stage.y
                };
            }

            stage.dest = {
                x: stage.start.x + position.x,
                y: stage.start.y + position.y
            };

        };

        this.panTo = function(position) {
            stage.dest = {
                x: position.x,
                y: position.y
            };
        };

        this.panStop = function() {
            panStarted = null;
        };

        function pushAll(pushDistance, center, except) {
            var minDistance = Infinity;
            angular.forEach(items, function(item) {
                minDistance = Math.min(minDistance, MapUtils.distance(center,  item.getPosition()));
            });
            pushDistance -= minDistance;
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                if(item == except)
                    continue;
                var p = item.getPosition();
                var is = MapUtils.getIntersections(center, p, center, MapUtils.distance(center, p) + pushDistance);
                if(!is.length) continue;
                var to = is[ ((p.x > center.x && is[0].x > center.x) || (p.x < center.x && is[0].x < center.x)) ? 0 : 1 ];
                item.moveTo(to);
            }
        }

        function expandItem(item) {
            var self = this;
            var currentPosition = item.getPosition();
            var center = { x: renderer.width / 2, y: renderer.height / 2 };
            var dPoints = MapUtils.getDistributedPoints(item.getPosition(), item.children.length);
            var maxRadius = MapUtils.distance(dPoints[dPoints.length -1], currentPosition);
            // push everything aside
            pushAll(maxRadius, item.getMoveDestination() || item.getPosition(), item);
            // hide cluster
            item.hide();
            // add all children
            angular.forEach(item.children, function(location, index) {
                var added = self.add({
                    location: location,
                    position: currentPosition,
                    before: item
                });
                added.child = true;
                added.moveTo(dPoints[index]);
            });
            expandTimeout = $timeout(function() {
                currentExpended = item;
                currentExpended.radius = maxRadius;
            }, 500);
            // bring to center
            var dest = { x: currentPosition.x + stage.position.x, y: currentPosition.y + stage.position.y };
            var delta = { x: center.x - dest.x, y: center.y - dest.y };
            self.panTo({ x: stage.position.x + delta.x, y: stage.position.y + delta.y });
        }

        this.tap = function(position) {
            for(var i=0;i<items.length; i++) {
                var item = items[i];
                if (item.isHit(position)) {
                    if (currentExpended) {
                        collapseItem();
                    }
                    expandItem.apply(this, [item]);
                }
            }
        };
    };

    function createRenderer(element, stage, additionalAnimation) {
        // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
        // which will try to choose the best renderer for the environment you are in.
        var renderer = new PIXI.autoDetectRenderer(800, 600);

        // The renderer will create a canvas element for you that you can then insert into the DOM.
        $(element)
            .append(renderer.view);


        function animate() {
            // start the timer for the next animation loop
            requestAnimationFrame(animate);
            additionalAnimation(renderer.width, renderer.height);
            // this is the main render call that makes pixi draw your container and its children.
            renderer.render(stage);
        }

        // kick off the animation loop (defined below)
        animate();

        return renderer;
    }
}]);