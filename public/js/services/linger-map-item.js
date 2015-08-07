angular.module("linger.services").factory("MapItem", [ "MapUtils", function(MapUtils) {

    var markerTexture = PIXI.Texture.fromImage('/images/marker.png');

    // todo: use loader to avoid texture loading delay
    // width and height are set here to make sure there will be a value when creating map items
    // although the marker texture itself isn't finished loading yet
    markerTexture.width = 69;
    markerTexture.height = 90;

    return function MapItem(options) {

        var children = options.children;
        var location = options.location;
        var stage = options.stage;
        var renderer = options.renderer;
        var anchor = options.anchor;
        var mask = options.mask;

        var isCluster = children && !!children.length;

        var label = isCluster ? children.length : (location.lng + "," + location.lat);
        var container = new PIXI.Container();
        var sprite = new PIXI.Sprite(markerTexture);
        var tag = new PIXI.Container();
        var text = new PIXI.Text(label ,{font : '20px Roboto', fill : isCluster ? 0xFFFFFF : 0x000, align : 'center', wordWrap: true});

        container.addChild(sprite);
        container.addChild(tag);

        sprite.tint = isCluster ? 0xE3E3E3 : 0xB1FF36;
        sprite.position = angular.copy(options.position);

        if(sprite.position) {
            addToStage(options.before);
        }

        this.location = location;
        this.sprite = sprite;
        this.container = container;
        this.children = children;

        function getScale(x, y) {
            var center = getCenter();
            var dx = center.x - (markerTexture.width / 2) - x - stage.position.x;
            var dy = center.y - (markerTexture.height / 2) - y - stage.position.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            var p = 100 - (d * 70 / Math.max(center.x, center.y));
            return p / 100;
        }

        function getCenter() {
            return {
                x: renderer.width / 2,
                y: renderer.height / 2
            }
        }

        function getPosition(location) {
            if (anchor.x) {
                return MapUtils.geoToPixel(location, {
                    x: (renderer.width / 2) - (anchor.x) + stage.position.x,
                    y: (renderer.height / 2) - (anchor.y) + stage.position.y
                });
            }
        }

        this.setPosition = function(position) {
            sprite.position = position;
            sprite.scale.x = sprite.scale.y = getScale(position.x, position.y);
        };

        this.getPosition = function() {
            return {
                x: sprite.position.x,
                y: sprite.position.y
            }
        };

        var moveDestinationPosition;

        function addToStage(before) {
            initializeTag();
            sprite.scale.x = sprite.scale.y = getScale(sprite.position.x, sprite.position.y);
            tag.scale.x = tag.scale.y = 0;
            if (before) {
                stage.addChildAt(container, stage.getChildIndex(before.container));
            }
            else {
                stage.addChild(container);
            }
        }

        this.updatePosition = function() {

            if (!sprite.position) {
                sprite.position = getPosition(location);
                if (sprite.position) {
                    addToStage();
                }
            }
            else {

                var scale = getScale(sprite.position.x, sprite.position.y);

                sprite.scale.x = sprite.scale.y = scale;

                tag.isVisible = mask.contains(sprite.position.x + stage.position.x, sprite.position.y + stage.position.y);

                tag.position.x = sprite.position.x + (markerTexture.width*scale / 2);
                tag.position.y = sprite.position.y;

                tag.targetScale = tag.isVisible ? scale : 0;

                if (moveDestinationPosition) {
                    sprite.position.x += (moveDestinationPosition.x - sprite.position.x) / 10;
                    sprite.position.y += (moveDestinationPosition.y - sprite.position.y) / 10;
                    if (!Math.floor(Math.abs(sprite.position.x - moveDestinationPosition.x)) && !(Math.floor(Math.abs(sprite.position.y - moveDestinationPosition.y)))) {
                        moveDestinationPosition = null;
                        if (moveCallback) {
                            moveCallback(this);
                            moveCallback = null;
                        }
                    }
                }
            }
        };

        /**
         *
         * @param x         Starting point (x) coordinate
         * @param y         Starting point (y) coordinate
         * @param width     The width of the bubble
         * @param height     Scale factor for the whole bubble
         * @returns         Polygon in a shape of a bubble
         *
         *       --------- w -----------
         *     ____________________________
         *    |                            |
         *    |                            |
         *    |____________  ______________|
         *                 \/
         *                (x,y)
         */
        function drawBubble(graphics, x, y, width, height) {
            graphics.moveTo(x,                      y);
            graphics.lineTo(x - (10),               y - (10));
            graphics.lineTo(x - (width/2),   y - (10));
            graphics.quadraticCurveTo(x - (width/2) - 10, y - 10, x - (width/2) - 10, y - 20);
            graphics.lineTo(x - (width/2) - (10),   y - (height));
            graphics.quadraticCurveTo(x - (width/2) - 10, y - (10 + height) , x - (width/2), y - (10 + height));
            graphics.lineTo(x + (width/2),   y - (10 + height));
            graphics.quadraticCurveTo(x + (width/2) + 10, y - (10 + height) , x + (width/2) + (10),  y - (height));
            graphics.lineTo(x + (width/2) + (10),   y - (20));
            graphics.quadraticCurveTo(x + (width/2) + 10, y - 10, x + (width/2),  y - 10);
            graphics.lineTo(x + (10),               y - (10));
        }

        function initializeTag() {

            var graphics = new PIXI.Graphics();
            var shadow = new PIXI.Graphics();

            tag.addChild(shadow);
            tag.addChild(graphics);
            tag.addChild(text);

            text.position.x = -(text.width/2);
            text.position.y = -47;

            var blurFilter = new PIXI.filters.BlurFilter();

            blurFilter.blur = 10;

            shadow.filters = [ blurFilter ];

            shadow.lineStyle(0);
            shadow.beginFill(0x000000, 0.2);
            drawBubble(shadow, 0, -8, text.width+3, 33);
            shadow.endFill();

            graphics.lineStyle(0);
            graphics.beginFill(isCluster ? 0xFF364D : 0xFFFFFF);
            drawBubble(graphics, 0, -10, text.width, 30);
            graphics.endFill();
        }

        this.animate = function() {
            this.updatePosition();
            if(angular.isDefined(tag.targetScale)) {
                var currentScale = tag.scale.x;
                tag.scale.x = tag.scale.y = currentScale + ( (tag.targetScale - currentScale) / 6 );
            }
        };

        var moveStartPosition, previousPos, moveCallback;

        this.move = function(delta) {
            if (!moveStartPosition) {
                moveStartPosition = {
                    x: sprite.position.x,
                    y: sprite.position.y
                };
            }
            moveDestinationPosition = {
                x: (moveStartPosition.x) + delta.x ,
                y: (moveStartPosition.y) + delta.y
            }
        };

        this.moveTo = function(position, callback) {
            previousPos = moveStartPosition = angular.copy(moveDestinationPosition || sprite.position);
            moveDestinationPosition = {
                x: position.x,
                y: position.y
            };
            moveCallback = callback;
        };

        this.revertPos = function() {
            if (previousPos) {
                this.moveTo(previousPos);
                previousPos = null;
            }
        };

        this.stop = function() {
            moveStartPosition = null;
        };

        this.isHit = function(position) {
            return sprite.containsPoint(position);
        };

        this.hide = function() {
            container.visible = false;
        };

        this.getMoveDestination = function() {
            return angular.copy(moveDestinationPosition);
        };

        this.show = function() {
            container.visible = true;
        };

        this.remove = function() {
            stage.removeChild(container);
        };

        this.showTag = function() {
        };

        this.hideTag = function() {
        };

        this.collideWidth = function(item) {
            return MapUtils.collide(container.getBounds(), item.container.getBounds());
        };

        this.updatePosition();
    }

}]);