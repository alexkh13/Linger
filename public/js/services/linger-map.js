angular.module("linger.services").factory("Map", [ "MapUtils", "MapItem", function(MapUtils, MapItem) {

    return function Map(element) {

        var stage = new PIXI.Container();
        var items = [];
        var resizeRan = false;
        var bgSprites = [];

        var ANCHOR = {
            x: undefined,
            y: undefined
        };

        var CURRENT = {
            x: 0,
            y: 0
        };

        var renderer = createRenderer(element, stage, animate);
        var centerView = new PIXI.Circle(0,0,0);

        function animate() {

            if (ANCHOR) {
                for(var i=0;i<items.length;i++) {
                    items[i].animate();
                }
            }
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
            centerView.radius = (Math.min(width,height)/2);
            centerView.x = width / 2;
            centerView.y = height / 2;
            if(!resizeRan) {
                resizeRan = true;
                //CURRENT.x += width / 2;
                //CURRENT.y += height / 2;

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
         * @param location
         */
        this.add = function(location, sub_locations) {

            items.push(new MapItem({
                location: location,
                children: sub_locations,
                stage: stage,
                renderer: renderer,
                anchor: ANCHOR,
                mask: centerView
            }));

        };

        /**
         *
         */
        this.getCurrentPosition = function() {
            return angular.copy(CURRENT);
        };

        var panStarted;
        var panTimeout;

        /**
         *
         * @param position
         */
        this.panTo = function(position) {

            var i, item, self = this;

            if(!panStarted) {
                panStarted = true;
                CURRENT.start = {
                    x: CURRENT.x,
                    y: CURRENT.y
                };
                for(i=0; i<bgSprites.length; i++) {
                    var bgSprite = bgSprites[i];
                    bgSprite.start = {
                        x: bgSprite.position.x,
                        y: bgSprite.position.y
                    };
                }
            }

            CURRENT.dest = {
                x: CURRENT.start.x + position.x,
                y: CURRENT.start.y + position.y
            };

            for(i=0; i<items.length; i++) {
                item = items[i];
                item.move(position);
            }

            for(i=0; i<bgSprites.length; i++) {
                var bgSprite = bgSprites[i];
                bgSprite.dest = {
                    x: bgSprite.start.x + position.x,
                    y: bgSprite.start.y + position.y
                };
            }

            if(!panTimeout) {
                panTimeout = setInterval(function() {

                    CURRENT.x += (CURRENT.dest.x - CURRENT.x) / 10;
                    CURRENT.y += (CURRENT.dest.y - CURRENT.y) / 10;

                    for(i=0; i<bgSprites.length; i++) {
                        var bgSprite = bgSprites[i];
                        bgSprite.position.x += (bgSprite.dest.x - bgSprite.position.x) / 10;
                        bgSprite.position.y += (bgSprite.dest.y - bgSprite.position.y) / 10;
                    }

                    for(var i=0; i<items.length; i++) {
                        var item = items[i];
                        item.updatePosition();
                    }
                }, 10);
            }
        };

        this.panStop = function() {
            clearInterval(panTimeout);
            panTimeout = null;
            panStarted = null;
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