angular.module("linger.services").factory("MapItem", [ "MapUtils", function(MapUtils) {

    var markerTexture = PIXI.Texture.fromImage('images/marker.png');
    var clusterTexture = PIXI.Texture.fromImage('images/cluster.png');

    // todo: use loader to avoid texture loading delay
    // width and height are set here to make sure there will be a value when creating map items
    // although the marker texture itself isn't finished loading yet
    markerTexture.width = 69;
    markerTexture.height = 90;

    var cnt = 0;

    return function MapItem(options) {

        var name = options.name;
        var children = options.children;
        var location = options.location;
        var stage = options.stage;
        var renderer = options.renderer;
        var anchor = options.anchor;
        var mask = options.mask;
        var parentContainer = options.container;
        var pinned = false;

        var isCluster = children && !!children.length;

        var label = name || (isCluster ? children.length : (location.lng + "," + location.lat));
        var container = new PIXI.Container();
        var sprite = new PIXI.Sprite(isCluster ? clusterTexture : markerTexture);
        var tag = new PIXI.Container();
        var text = new PIXI.Text(label ,{font : '18px Arial', fill : isCluster ? 0xFFFFFF : 0x000, align : 'center'});

        if (!isCluster) {
            var image = options.image ? "data:image/jpeg;base64," + options.image : "images/group_placeholder.jpg";
            var img = new PIXI.Sprite.fromImage(image);
            var imgMask = new PIXI.Graphics();
            imgMask.beginFill(0x000);
            imgMask.drawCircle(34   ,25,20);
            imgMask.endFill();
            img.position.x = 5;
            img.width = 55;
            img.height = 55;
            img.mask = imgMask;
            container.addChild(imgMask);
            container.addChild(img);
        }

        container.addChild(sprite);
        container.addChild(tag);

        sprite.tint = isCluster ? 0xE3E3E3 : 0xB1FF36;

        container.position = angular.copy(options.position);
        container.pivot = new PIXI.Point(markerTexture.width / 2, 0);

        if(container.position) {
            addToStage(options.before);
        }

        this.location = location;
        this.sprite = sprite;
        this.container = container;
        this.children = children;

        function getScale(x, y) {
            var center = getCenter();
            var dx = center.x - x - stage.position.x;
            var dy = center.y - y - stage.position.y;
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
            container.position = position;
            container.scale.x = container.scale.y = getScale(position.x, position.y);
        };

        this.getPosition = function() {
            return {
                x: container.position.x,
                y: container.position.y
            }
        };

        var moveDestinationPosition;

        function addToStage(before) {
            initializeTag();
            container.scale.x = container.scale.y = getScale(container.position.x, container.position.y);
            tag.scale.x = tag.scale.y = 0;
            if (before) {
                parentContainer.addChildAt(container, 0);
            }
            else {
                parentContainer.addChild(container);
            }
        }

        function inFocus() {
            return pinned || mask.contains(container.position.x + stage.position.x, container.position.y + stage.position.y);
        }

        this.updatePosition = function() {

            if (!container.position) {
                container.position = getPosition(location);
                if (container.position) {
                    addToStage();
                }
            }
            else if(pinned) {
                container.scale.x = container.scale.y = tag.targetScale = 1;
                var stageTopPos = {
                    x: -stage.position.x - container.position.x + renderer.width/2 + 35,
                    y: -stage.position.y - container.position.y + 60
                };
                tag.position = {
                    x: tag.position.x + ((stageTopPos.x - tag.position.x)/4),
                    y: tag.position.y + ((stageTopPos.y - tag.position.y)/4)
                }
            }
            else {

                var scale = getScale(container.position.x, container.position.y);

                tag.position = {
                    x: tag.position.x + (((markerTexture.width/2) - tag.position.x)/6),
                    y: tag.position.y + ((-tag.position.y)/6)
                };

                tag.targetScale = (inFocus() && tag.visible) ? scale : 0;

                if (moveDestinationPosition) {
                    if(angular.isDefined(moveDestinationPosition.scale)) {
                        var currentScale = container.scale.x;
                        container.scale.x = container.scale.y = currentScale + ((moveDestinationPosition.scale - currentScale)/(moveDestinationPosition.factor || 6));
                    }
                    else {
                        container.scale.x = container.scale.y = scale;
                    }
                    container.position.x += (moveDestinationPosition.x - container.position.x) / (moveDestinationPosition.factor || 6);
                    container.position.y += (moveDestinationPosition.y - container.position.y) / (moveDestinationPosition.factor || 6);
                    if (!Math.floor(Math.abs(container.position.x - moveDestinationPosition.x)) && !(Math.floor(Math.abs(container.position.y - moveDestinationPosition.y)))) {
                        moveDestinationPosition = null;
                        if (moveCallback) {
                            moveCallback(this);
                            moveCallback = null;
                        }
                    }
                }
                else {
                    container.scale.x = container.scale.y = scale;
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

        function initializeTag(expanded) {

            var shadowDistance = 3;
            var graphics = new PIXI.Graphics();
            var shadow = new PIXI.Graphics();
            var tagWidth = expanded ? (renderer.width - 35) : text.width;

            tag.removeChildren();

            tag.addChild(shadow);
            tag.addChild(graphics);
            tag.addChild(text);

            tag.position.x = (markerTexture.width/2);
            tag.pivot = new PIXI.Point(tag.position.x,0);

            text.position.x = -(text.width/2) + tag.position.x;
            text.position.y = -47;

            var blurFilter = new PIXI.filters.BlurFilter();

            blurFilter.blur = 10;

            shadow.filters = [ blurFilter ];

            shadow.lineStyle(0);
            shadow.beginFill(0x000000, 0.2);
            drawBubble(shadow, tag.position.x, -8, tagWidth + shadowDistance, 30 + shadowDistance);
            shadow.endFill();

            graphics.lineStyle(0);
            graphics.beginFill(isCluster ? 0xFF364D : 0xFFFFFF);
            drawBubble(graphics, tag.position.x, -10, tagWidth, 30);
            graphics.endFill();
        }

        function expandTag() {
            initializeTag(true);
        }

        function collapseTag() {
            initializeTag();
        }

        this.animate = function() {
            this.updatePosition();
            if(angular.isDefined(tag.targetScale)) {
                var currentScale = tag.scale.x;
                tag.scale.x = tag.scale.y = currentScale + ( (tag.targetScale - currentScale) / 6 );
                if(tag.scale.x == tag.targetScale) {
                    delete tag.targetScale;
                }
            }
        };

        var moveStartPosition, previousPos, moveCallback;

        this.move = function(delta) {
            if (!moveStartPosition) {
                moveStartPosition = {
                    x: container.position.x,
                    y: container.position.y
                };
            }
            moveDestinationPosition = {
                x: (moveStartPosition.x) + delta.x ,
                y: (moveStartPosition.y) + delta.y
            }
        };

        this.moveTo = function(position, callback, factor, scale) {
            previousPos = moveStartPosition = angular.copy(moveDestinationPosition || container.position);
            moveDestinationPosition = {
                factor: factor,
                scale: scale,
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
            parentContainer.removeChild(container);
        };

        this.showTag = function() {
            tag.visible = true;
            if(inFocus()) {
                tag.scale.x = tag.scale.y = 0;
                tag.targetScale = container.scale.x;
            }
        };

        this.hideTag = function() {
            tag.visible = false;
        };

        this.isVisible = function() {
            return container.visible;
        };

        this.pin = function() {
            pinned = true;
            sprite.visible = false;
            expandTag();
        };

        this.unpin = function() {
            pinned = false;
            sprite.visible = true;
            collapseTag();
        };

        this.updatePosition();
    }

}]);