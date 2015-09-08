angular.module("linger.services").factory("Map", [ "$timeout", "MapUtils", "MapItem", function($timeout, MapUtils, MapItem) {

    return function Map(element, events) {

        var stage = new PIXI.Container();
        var backgroundContainer = new PIXI.Container();
        var pointsContainer = new PIXI.Container();
        var items = [];
        var resizeRan = false;
        var currentExpended, expandTimeout;
        var maxX, minX, maxY, minY;
        var worldMin = 500;

        var ANCHOR = {
            x: undefined,
            y: undefined
        };

        var renderer = createRenderer(element, stage, animate);
        var centerView = new PIXI.Circle(0,0,0);

        stage.addChild(backgroundContainer);
        stage.addChild(pointsContainer);

        function animate() {

            var i, j;

            for (i=0; i<items.length; i++) {
                items[i].animate();
                if(!items[i]) continue;
                var pos = items[i].getPosition();
                maxX = Math.max(maxX || 0, pos.x);
                maxY = Math.max(maxY || 0, pos.y);
                minX = Math.min(minX || Infinity, pos.x);
                minY = Math.min(minY || Infinity, pos.y);

                for (j=0; j<items.length; j++) {
                    if (items[i] == items[j] || !items[j] || !items[i]) continue;
                    try {
                        var ii = pointsContainer.getChildIndex(items[i].container);
                        var ij = pointsContainer.getChildIndex(items[j].container);
                        var si = items[i].container.scale.x;
                        var sj = items[j].container.scale.x;
                        if ((si > sj && ii < ij) ||
                            (si < sj && ii > ij)) {
                            pointsContainer.swapChildren(items[i].container, items[j].container);
                        }
                    }
                    catch(err) {
                        // animate ran too fast
                        // stage is not populated yet
                    }
                }
            }

            if (stage.dest) {
                var delta = {
                    x: (stage.dest.x - stage.position.x) / 10,
                    y: (stage.dest.y - stage.position.y) / 10
                };
                stage.position.x += delta.x;
                stage.position.y += delta.y;

                // automatically collapse when moving out
                if (currentExpended) {

                    var pos = currentExpended.getPosition();
                    pos = { x: pos.x + stage.position.x, y: pos.y + stage.position.y };
                    var center = { x: renderer.width / 2, y: renderer.height /2 };
                    var distance = MapUtils.distance(center, pos);

                    if(distance > currentExpended.radius + 100) {
                        collapseItem();
                    }
                }
            }
        }

        function collapseItem() {
            if (!currentExpended) return;
            clearTimeout(expandTimeout);
            currentExpended.unpin();
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                if(item.child) {
                    item.hideTag();
                    item.moveTo(currentExpended.getPosition(), function(item) {
                        item.remove();
                        items.splice(items.indexOf(item), 1);
                    }, 5, 0);
                }
                else {
                    item.revertPos();
                }
            }
            currentExpended = undefined;
        }

        this.setCurrentLocation = function(location) {
            angular.extend(ANCHOR, MapUtils.geoToPixel(location));
        };

        function buildWorld(width, height) {
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

                backgroundContainer.addChild(sprite);
            }

            //var bgTileSprite = new PIXI.extras.TilingSprite.fromImage("/images/bg.png", 2000, 2000);
            //
            //bgTileSprite.position.x = (width / 2) - 1000;
            //bgTileSprite.position.y = (height / 2) - 1000;

            //stage.addChild(bgTileSprite);

            for(var i=-1000; i <= 2000; i+=1000) {
                for(var j=-1000; j <= 2000; j+=1000) {
                    addBgSprite(i ,j);
                }
            }
        }

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
                buildWorld(width, height);
            }
        };

        /**
         *
         * @param point
         */
        this.add = function(point) {

            var item = new MapItem({
                id: point.id,
                name: point.name,
                location: point.location,
                children: point.sub_points,
                stage: stage,
                container: pointsContainer,
                renderer: renderer,
                anchor: ANCHOR,
                mask: centerView,
                position: point.position,
                map: this,
                before: point.before,
                image: point.image
            });

            items.push(item);

            return item;

        };

        this.remove = function(id) {
            collapseItem();
            for(var i=0;i<items.length;i++) {
                if(items[i].id == id) {
                    items[i].remove();
                    break;
                }
            }
            items.splice(i, 1);
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

            //var padding = 200;

            // stage is moving the opposite way
            //var limit = [
            //    -maxX - padding + renderer.width,
            //    -maxY - padding + renderer.height,
            //    -minX + padding,
            //    -minY + padding
            //];

            // right
            //if (stage.dest.x < limit[0])
            //    stage.dest.x = limit[0] - ((limit[0] - stage.dest.x)/6);

            // bottom
            //if (stage.dest.y < limit[1])
            //    stage.dest.y = limit[1] - ((limit[1] - stage.dest.y)/6);

            // left
            //if (stage.dest.x > limit[2])
            //    stage.dest.x = limit[2] - ((limit[2] - stage.dest.x)/6);

            // top
            //if (stage.dest.y > limit[3])
            //    stage.dest.y = limit[3] - ((limit[3] - stage.dest.y)/6);

        };

        this.panTo = function(position) {
            stage.dest = {
                x: position.x,
                y: position.y
            };
        };

        this.panStop = function() {
            panStarted = null;

            var padding = 200;
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
            if(currentExpended) return;
            currentExpended = item;
            var self = this;
            var currentPosition = item.getPosition();
            var center = { x: renderer.width / 2, y: renderer.height / 2 };
            var dPoints = MapUtils.getDistributedPoints(item.getPosition(), item.children.length);
            var maxRadius = MapUtils.distance(dPoints[dPoints.length -1], currentPosition);
            // push everything aside
            pushAll(maxRadius, item.getMoveDestination() || item.getPosition(), item);
            // hide cluster
            item.pin();
            // bring to front
            pointsContainer.setChildIndex(item.container, items.length-1);
            // add all children
            angular.forEach(item.children, function(item, index) {
                var added = self.add({
                    id: item.id,
                    name: item.name,
                    location: item.location,
                    position: currentPosition,
                    before: item,
                    image: item.image
                });
                added.child = true;
                added.hideTag();
                added.moveTo(dPoints[index], function() {
                    added.showTag();
                });
            });
            expandTimeout = $timeout(function() {
                currentExpended.radius = maxRadius;
            }, 500);
            // bring to center
            var dest = { x: currentPosition.x + stage.position.x, y: currentPosition.y + stage.position.y };
            var delta = { x: center.x - dest.x, y: center.y - dest.y };
            self.panTo({ x: stage.position.x + delta.x, y: stage.position.y + delta.y });
        }

        this.tap = function(position) {

            var cluster = false;

            for(var i=0;i<items.length; i++) {
                var item = items[i];
                if (item.isHit(position) && item.isVisible()) {
                    if (!currentExpended && item.isCluster) {
                        expandItem.apply(this, [item]);
                        cluster = true;
                    }
                    else if (!item.isCluster){
                        events.onClick(item.id);
                    }
                }
            }

            if (!cluster && currentExpended) {
                collapseItem();
            }
        };
    };

    function createRenderer(element, stage, additionalAnimation) {
        // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
        // which will try to choose the best renderer for the environment you are in.
        var renderer = new PIXI.CanvasRenderer(800, 600, {transparent: true});

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