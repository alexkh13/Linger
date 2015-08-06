angular.module("linger.services").factory("MapItem", [ "MapUtils", function(MapUtils) {

    var markerTexture = PIXI.Texture.fromImage('/images/marker.png');

    return function MapItem(options) {

        var children = options.children;
        var location = options.location;
        var stage = options.stage;
        var renderer = options.renderer;
        var anchor = options.anchor;
        var mask = options.mask;
        var map = options.map;

        var label = (children && children.length) || (location.lng + "," + location.lat);
        var container = new PIXI.Container();
        var sprite = new PIXI.Sprite(markerTexture);
        var graphics = new PIXI.Graphics();
        var text = new PIXI.Text(label ,{font : '20px Roboto', fill : 0x000, align : 'center', wordWrap: true});

        container.addChild(sprite);
        container.addChild(graphics);
        container.addChild(text);

        sprite.interactive = true;
        sprite.tint = (children && children.length) ? 0xFFFFFF : 0x74d600;
        sprite.position = angular.copy(options.position);

        if(sprite.position) {
            addToStage(options.before);
        }

        this.position = angular.copy(sprite.position);
        this.location = location;
        this.sprite = sprite;
        this.graphics = graphics;
        this.text = text;
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
            sprite.scale.x = sprite.scale.y = getScale(sprite.position.x, sprite.position.y);
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
                    this.position = angular.copy(sprite.position);
                    addToStage();
                }
            }
            else {

                sprite.scale.x = sprite.scale.y = getScale(sprite.position.x, sprite.position.y);

                if (moveDestinationPosition) {
                    sprite.position.x += (moveDestinationPosition.x - sprite.position.x) / 10;
                    sprite.position.y += (moveDestinationPosition.y - sprite.position.y) / 10;
                    if (!Math.floor(Math.abs(sprite.position.x - moveDestinationPosition.x)) && !(Math.floor(Math.abs(sprite.position.y - moveDestinationPosition.y)))) {
                        moveDestinationPosition = null;
                    }
                }
            }
        };

        /**
         *
         * @param x         Starting point (x) coordinate
         * @param y         Starting point (y) coordinate
         * @param width     The width of the bubble
         * @param scale     Scale factor for the whole bubble
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
        function getBubbleShape(x, y, width, scale) {
            return new PIXI.Polygon([
                x,                              y,
                x - (scale*10),                 y - (scale*10),
                x - (width/2) - (scale*10),     y - (scale*10),
                x - (width/2) - (scale*10),     y - (scale*40) ,
                x + (width/2) + (scale*10),     y - (scale*40),
                x + (width/2) + (scale*10),     y - (scale*10),
                x + (scale*10),                 y - (scale*10)
            ]);

        }

        this.animate = function() {

            if(!this.position) return;

            var scale = getScale(sprite.position.x, sprite.position.y);

            graphics.clear();

            var x = sprite.position.x;
            var y = sprite.position.y;

            var w = markerTexture.width * scale;

            text.scale = { x: scale, y: scale };

            text.visible = mask.contains(sprite.position.x + stage.position.x, sprite.position.y + stage.position.y);

            if (text.visible) {

                text.position.x = x + (w/2) - (text.width/2);
                text.position.y = y - (scale*50) + (scale*3);

                var bubble = getBubbleShape(x + (w/2), y  - (scale*10), text.width, scale);

                graphics.lineStyle(0);
                graphics.beginFill(0xFFFFFF);
                graphics.drawShape(bubble);
                graphics.endFill();
            }
        };

        var moveStartPosition, previousPos;

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

        this.moveTo = function(position) {
            previousPos = moveStartPosition = angular.copy(moveDestinationPosition || sprite.position);
            moveDestinationPosition = {
                x: position.x,
                y: position.y
            };
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

        this.updatePosition();
    }

}]);