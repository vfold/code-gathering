///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/********************************************************************************
 * Stage constructor.  A stage is used to contain multiple layers and handle
 * animations
 * @constructor
 * @augments Container
 * @augments Node
 * @param {String|DomElement} cont Container id or DOM element
 * @param {int} width
 * @param {int} height
 *********************************************************************************/
var stage = {};

stage.init = function() {

    stage.init = undefined;

    /*****************************************************************
     * Add the DIV container to the HTML header
     * Stage container DOM element
     *****************************************************************/

    stage.container = document.createElement("div"),
    resizeCallbacks = [];
    stage.container.setAttribute('id', "container");
    document.body.appendChild(stage.container);
    //stageContainer = div.childNodes[0];
    //stageContainer.style.backgroundColor = "#333333";

    /*****************************************************************
     * On Stage resize callback
     *****************************************************************/

    stage.addResizeCallback = function(func) {
        resizeCallbacks.push(func);
    };

    window.onresize = function() {
        var width = window.innerWidth,
            height = window.innerHeight;

        stage.container.style.width = "" + width + "px";
        stage.container.style.height = "" + height + "px";

        stage.setSize(width, height);

        for (var key in resizeCallbacks) {
            resizeCallbacks[key]();
        }

        stage.draw();
    }

    // Extend Container and Node
    put(stage, Container.prototype);

    stage.width = 400;
    stage.height = 200;
    stage.nodeType = 'Stage';
    stage.ids = {};
    stage.names = {};
    stage.children = new Array();

    // content DOM element
    stage.content = document.createElement('div');
    stage.dblClickWindow = 400;
    stage.clickStart = false;
    stage.targetShape = undefined;
    stage.targetFound = false;
    stage.mouseoverShape = undefined;
    stage.mouseoutShape = undefined;

    /********************** 
     * Desktop flags
     **********************/

    // get mouse position for desktop apps
    stage.mousePos = undefined;
    stage.mouseDown = false;
    stage.mouseUp = false;

    /********************** 
     * Mobile flags
     **********************/

    // get touch position for mobile apps
    stage.touchPos = undefined;
    stage.touchStart = false;
    stage.touchEnd = false;

    // set stage id
    var id = engine.idCounter++;

    buildDOM();
    listen();
    prepareDrag();

    stage.anim = undefined;
    stage.addId(this);

    /*******************************************************************
     * detect event
     * @param {Shape} shape
     *******************************************************************/
    function detectEvent(shape, evt) {
            var isDragging = engine.drag.moving;
            var pos = stage.getUserPosition();
            var el = shape.eventListeners;

            if (stage.targetShape && shape._id === stage.targetShape._id) {
                stage.targetFound = true;
            }

            if (shape.visible && pos !== undefined && shape.isPointInShape(pos)) {
                // handle onmousedown
                if (!isDragging && stage.mouseDown) {
                    stage.mouseDown = false;
                    stage.clickStart = true;
                    shape._handleEvents('onmousedown', evt);
                    return true;
                }
                // handle onmouseup & onclick
                else if (stage.mouseUp) {
                    stage.mouseUp = false;
                    shape._handleEvents('onmouseup', evt);

                    // detect if click or double click occurred
                    if (stage.clickStart) {
                        /*******************************************************************
                         * if dragging and dropping, don't fire click or dbl click
                         * event
                         *******************************************************************/
                        if ((!engine.drag.moving) || !engine.drag.node) {
                            shape._handleEvents('onclick', evt);

                            if (shape.inDoubleClickWindow) {
                                shape._handleEvents('ondblclick', evt);
                            }
                            shape.inDoubleClickWindow = true;
                            setTimeout(function() {
                                shape.inDoubleClickWindow = false;
                            }, stage.dblClickWindow);
                        }
                    }
                    return true;
                }

                // handle touchstart
                else if (stage.touchStart) {
                    stage.touchStart = false;
                    shape._handleEvents('touchstart', evt);

                    if (el.ondbltap && shape.inDoubleClickWindow) {
                        var events = el.ondbltap;
                        for (var i = 0; i < events.length; i++) {
                            events[i].handler.apply(shape, [evt]);
                        }
                    }

                    shape.inDoubleClickWindow = true;

                    setTimeout(function() {
                        shape.inDoubleClickWindow = false;
                    }, stage.dblClickWindow);
                    return true;
                }

                // handle touchend
                else if (stage.touchEnd) {
                    stage.touchEnd = false;
                    shape._handleEvents('touchend', evt);
                    return true;
                }

                /*******************************************************************
                 * NOTE: these event handlers require target shape
                 * handling
                 *******************************************************************/

                // handle onmouseover
                else if (!isDragging && _isNewTarget(shape, evt)) {

                    /*******************************************************************
                     * if there are, run those before running the onmouseover
                     * events
                     *******************************************************************/

                    if (stage.mouseoutShape) {
                        stage.mouseoverShape = shape;
                        stage.mouseoutShape._handleEvents('onmouseout', evt);
                        stage.mouseoverShape = undefined;
                    }

                    shape._handleEvents('onmouseover', evt);
                    _setTarget(shape);
                    return true;
                }

                // handle mousemove and touchmove
                else if (!isDragging) {
                    shape._handleEvents('onmousemove', evt);
                    shape._handleEvents('touchmove', evt);
                    return true;
                }
            }
            // handle mouseout condition
            else if (!isDragging && stage.targetShape && stage.targetShape._id === shape._id) {
                _setTarget(undefined);
                stage.mouseoutShape = shape;
                return true;
            }

            return false;
        };
    /*******************************************************************
     * set new target
     *******************************************************************/

    function setTarget(shape) {
            stage.targetShape = shape;
            stage.targetFound = true;
        };
    /*******************************************************************
     * check if shape should be a new target
     *******************************************************************/

    function isNewTarget(shape, evt) {

            if (!stage.targetShape || (!stage.targetFound && shape._id !== stage.targetShape._id)) {

                /*******************************************************************
                 * check if old target has an onmouseout event listener
                 *******************************************************************/

                if (stage.targetShape) {
                    var oldEl = stage.targetShape.eventListeners;
                    if (oldEl) {
                        stage.mouseoutShape = stage.targetShape;
                    }
                }
                return true;
            } else {
                return false;
            }
        };
    /*******************************************************************
     * traverse container children
     * @param {Container} obj
     *******************************************************************/
    function traverseChildren(obj, evt) {
            var children = obj.children,
                exit;
            // propapgate backwards through children
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                if (child.listening) {
                    if (child.nodeType === 'Shape') {
                        exit = _detectEvent(child, evt);
                        if (exit) {
                            return true;
                        }
                    } else {
                        exit = _traverseChildren(child, evt);
                        if (exit) {
                            return true;
                        }
                    }
                }
            }

            return false;
        };
    /*******************************************************************
     * handle incoming event
     * @param {Event} evt
     *******************************************************************/
    function handleStageEvent(evt) {
            if (!evt) {
                evt = window.event;
            }

            setMousePosition(evt);
            setTouchPosition(evt);
            stage.pathLayer.clear();

            /*******************************************************************
             * loop through layers.  If at any point an event
             * is triggered, n is set to -1 which will break out of the
             * three nested loops
             *******************************************************************/

            stage.targetFound = false;
            var shapeDetected = false;
            for (var n = stage.children.length - 1; n >= 0; n--) {
                var layer = stage.children[n];
                if (layer.visible && n >= 0 && layer.listening) {
                    if (_traverseChildren(layer, evt)) {
                        n = -1;
                        shapeDetected = true;
                    }
                }
            }

            /*******************************************************************
             * if no shape was detected and a mouseout shape has been stored,
             * then run the onmouseout event handlers
             *******************************************************************/

            if (!shapeDetected && stage.mouseoutShape) {
                stage.mouseoutShape._handleEvents('onmouseout', evt);
                stage.mouseoutShape = undefined;
            }
        };

    /*******************************************************************
     * begin listening for events by adding event handlers
     * to the container
     *******************************************************************/

    function listen() {

            // desktop events
            stage.content.addEventListener('mousedown', function(evt) {
                stage.mouseDown = true;
                handleStageEvent(evt);
            }, false);

            stage.content.addEventListener('mousemove', function(evt) {
                stage.mouseUp = false;
                stage.mouseDown = false;
                handleStageEvent(evt);
            }, false);

            stage.content.addEventListener('mouseup', function(evt) {
                stage.mouseUp = true;
                stage.mouseDown = false;
                handleStageEvent(evt);

                stage.clickStart = false;
            }, false);

            stage.content.addEventListener('mouseover', function(evt) {
                handleStageEvent(evt);
            }, false);

            stage.content.addEventListener('mouseout', function(evt) {
                // if there's a current target shape, run mouseout handlers
                var targetShape = stage.targetShape;
                if (targetShape) {
                    targetShape._handleEvents('onmouseout', evt);
                    stage.targetShape = undefined;
                }
                stage.mousePos = undefined;
            }, false);
            // mobile events
            stage.content.addEventListener('touchstart', function(evt) {
                evt.preventDefault();
                stage.touchStart = true;
                handleStageEvent(evt);
            }, false);

            stage.content.addEventListener('touchmove', function(evt) {
                evt.preventDefault();
                handleStageEvent(evt);
            }, false);

            stage.content.addEventListener('touchend', function(evt) {
                evt.preventDefault();
                stage.touchEnd = true;
                handleStageEvent(evt);
            }, false);
        };

    /*******************************************************************
     * set mouse positon for desktop apps
     * @param {Event} evt
     *******************************************************************/

    function setMousePosition(evt) {
            var mouseX = evt.offsetX || (evt.clientX - _getContentPosition().left + window.pageXOffset);
            var mouseY = evt.offsetY || (evt.clientY - _getContentPosition().top + window.pageYOffset);
            stage.mousePos = {
                x: mouseX,
                y: mouseY
            };
        };

    /*******************************************************************
     * set touch position for mobile apps
     * @param {Event} evt
     *******************************************************************/

    function setTouchPosition(evt) {
            if (evt.touches !== undefined && evt.touches.length === 1) { // Only deal with
                // one finger
                var touch = evt.touches[0];
                // Get the information for finger #1
                var touchX = touch.clientX - _getContentPosition().left + window.pageXOffset;
                var touchY = touch.clientY - _getContentPosition().top + window.pageYOffset;

                stage.touchPos = {
                    x: touchX,
                    y: touchY
                };
            }
        };

    /*******************************************************************
     * get container position
     *******************************************************************/

    function getContentPosition() {
            var obj = stage.content;
            var top = 0;
            var left = 0;
            while (obj && obj.tagName !== 'BODY') {
                top += obj.offsetTop - obj.scrollTop;
                left += obj.offsetLeft - obj.scrollLeft;
                obj = obj.offsetParent;
            }
            return {
                top: top,
                left: left
            };
        };

    /*******************************************************************
     * modify path context
     * @param {CanvasContext} context
     *******************************************************************/

    function modifyPathContext(context) {
            context.stroke = function() {};
            context.fill = function() {};
            context.fillRect = function(x, y, width, height) {
                context.rect(x, y, width, height);
            };
            context.strokeRect = function(x, y, width, height) {
                context.rect(x, y, width, height);
            };
            context.drawImage = function() {};
            context.fillText = function() {};
            context.strokeText = function() {};
        };

    /*******************************************************************
     * end drag and drop
     *******************************************************************/

    function endDrag(evt) {
            if (engine.drag.node) {
                if (engine.drag.moving) {
                    engine.drag.moving = false;
                    engine.drag.node.handleEvents('ondragend', evt);
                }
            }
            engine.drag.node = undefined;
        };

    /*******************************************************************
     * prepare drag and drop
     *******************************************************************/

    function prepareDrag() {
            var that = this;

            stage.onContent('mousemove touchmove', function(evt) {
                var node = engine.drag.node;
                if (node) {
                    var date = new Date();
                    var time = date.getTime();

                    if (time - engine.drag.lastDrawTime > engine.dragTimeInterval) {
                        engine.drag.lastDrawTime = time;

                        var pos = that.getUserPosition();
                        var dc = node.dragConstraint;
                        var db = node.dragBounds;
                        var lastNodePos = {
                            x: node.x,
                            y: node.y
                        };

                        // default
                        var newNodePos = {
                            x: pos.x - engine.drag.offset.x,
                            y: pos.y - engine.drag.offset.y
                        };

                        // bounds overrides
                        if (db.left !== undefined && newNodePos.x < db.left) {
                            newNodePos.x = db.left;
                        }
                        if (db.right !== undefined && newNodePos.x > db.right) {
                            newNodePos.x = db.right;
                        }
                        if (db.top !== undefined && newNodePos.y < db.top) {
                            newNodePos.y = db.top;
                        }
                        if (db.bottom !== undefined && newNodePos.y > db.bottom) {
                            newNodePos.y = db.bottom;
                        }

                        node.setAbsolutePosition(newNodePos);

                        // constraint overrides
                        if (dc === 'horizontal') {
                            node.y = lastNodePos.y;
                        } else if (dc === 'vertical') {
                            node.x = lastNodePos.x;
                        }

                        engine.drag.node.getLayer().draw();

                        if (!engine.drag.moving) {
                            engine.drag.moving = true;
                            // execute dragstart events if defined
                            engine.drag.node.handleEvents('ondragstart', evt);
                        }

                        // execute user defined ondragmove if defined
                        engine.drag.node.handleEvents('ondragmove', evt);
                    }
                }
            }, false);

            stage.onContent('mouseup touchend mouseout', function(evt) {
                that.endDrag(evt);
            });
        };

    /*******************************************************************
     * build dom
     *******************************************************************/

    function buildDOM() {
            // content
            stage.content.style.width = stage.width + 'px';
            stage.content.style.height = stage.height + 'px';
            stage.content.style.position = 'relative';
            stage.content.style.display = 'inline-block';
            stage.content.className = 'stage-content';
            stage.container.appendChild(stage.content);

            // default layers
            stage.bufferLayer = new Layer();
            stage.pathLayer = new Layer();

            // set parents
            stage.bufferLayer.parent = this;
            stage.pathLayer.parent = this;

            // customize back stage context
            modifyPathContext(stage.pathLayer.context);

            // hide canvases
            stage.bufferLayer.canvas.style.display = 'none';
            stage.pathLayer.canvas.style.display = 'none';

            // add buffer layer
            stage.bufferLayer.canvas.width = stage.width;
            stage.bufferLayer.canvas.height = stage.height;
            stage.bufferLayer.canvas.className = 'stage-buffer-layer';
            stage.content.appendChild(stage.bufferLayer.canvas);

            // add path layer
            stage.pathLayer.canvas.width = stage.width;
            stage.pathLayer.canvas.height = stage.height;
            stage.pathLayer.canvas.className = 'stage-path-layer';
            stage.content.appendChild(stage.pathLayer.canvas);
        };
};

    stage.addId = function(node) {
            if (node.id !== undefined) {
                stage.ids[node.id] = node;
            }
        };
    stage.removeId = function(node) {
            if (node.id !== undefined) {
                stage.ids[node.id] = undefined;
            }
        };

    /*******************************************************************
     * sets onFrameFunc for animation
     * @param {function} func
     *******************************************************************/

    stage.onFrame = function(func) {
        stage.anim = {
            func: func
        };
    };

    /*******************************************************************
     * start animation
     *******************************************************************/

    stage.start = function() {
        engine.addAnimation(stage.anim);
        engine.handleAnimation();
    };

    /*******************************************************************
     * stop animation
     *******************************************************************/

    stage.stop = function() {
        engine.removeAnimation(stage.anim.id);
        engine.handleAnimation();
    };

    /*******************************************************************
     * draw children
     *******************************************************************/

    stage.draw = function() {
        stage._drawChildren();
    };

    /*******************************************************************
     * set stage size
     * @param {int} width
     * @param {int} height
     *******************************************************************/

    stage.setSize = function(width, height) {
        var layers = stage.children;
        for (var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.canvas.width = width;
            layer.canvas.height = height;
            layer.draw();
        }

        // set stage dimensions
        stage.width = width;
        stage.height = height;

        // set buffer layer and path layer sizes
        stage.bufferLayer.canvas.width = width;
        stage.bufferLayer.canvas.height = height;
        stage.pathLayer.canvas.width = width;
        stage.pathLayer.canvas.height = height;
    };

    /*******************************************************************
     * return stage size
     *******************************************************************/

    stage.getSize = function() {
        return {
            width: stage.width,
            height: stage.height
        };
    };

    /*******************************************************************
     * clear all layers
     *******************************************************************/

    stage.clear = function() {
        var layers = stage.children;
        for (var n = 0; n < layers.length; n++) {
            layers[n].clear();
        }
    };

    /***********************************************************************************
     * Creates a composite data URL and passes it to a callback. If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0)
     * @param {function} callback
     * @param {String} mimeType (optional)
     * @param {Number} quality (optional)
     ***********************************************************************************/

    stage.toDataURL = function(callback, mimeType, quality) {
        var bufferLayer = stage.bufferLayer;
        var bufferContext = bufferLayer.getContext();
        var layers = stage.children;
        var that = this;

        function addLayer(n) {
            var dataURL = layers[n].canvas.toDataURL();
            var imageObj = new Image();
            imageObj.onload = function() {
                bufferContext.drawImage(this, 0, 0);
                n++;
                if (n < layers.length) {
                    addLayer(n);
                } else {
                    try {
                        // If this call fails (due to browser bug, like in Firefox 3.6),
                        // then revert to previous no-parameter image/png behavior
                        callback(bufferLayer.canvas.toDataURL(mimeType, quality));
                    } catch (exception) {
                        callback(bufferLayer.canvas.toDataURL());
                    }
                }
            };
            imageObj.src = dataURL;
        }

        bufferLayer.clear();
        addLayer(0);
    };

    /*******************************************************************
     * serialize stage and children as a JSON object
     *******************************************************************/

    stage.toJSON = function() {
        function addNode(node) {
            var obj = {};
            obj.attrs = node.attrs;

            obj.nodeType = node.nodeType;
            obj.shapeType = node.shapeType;

            if (node.nodeType !== 'Shape') {
                obj.children = [];

                var children = node.getChildren();
                for (var n = 0; n < children.length; n++) {
                    var child = children[n];
                    obj.children.push(addNode(child));
                }
            }

            return obj;
        }
        return JSON.stringify(addNode(this));
    };

    /***************************************************************************************
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     *  serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @param {String} JSON string
     ***************************************************************************************/

    stage.load = function(json) {
        function loadNode(node, obj) {
            var children = obj.children;
            if (children !== undefined) {
                for (var n = 0; n < children.length; n++) {
                    var child = children[n];
                    var type;

                    // determine type
                    if (child.nodeType === 'Shape') {
                        // add custom shape
                        if (child.shapeType === undefined) {
                            type = 'Shape';
                        }
                        // add standard shape
                        else {
                            type = child.shapeType;
                        }
                    } else {
                        type = child.nodeType;
                    }

                    var no = new Kinetic[type](child.attrs);
                    node.add(no);
                    loadNode(no, child);
                }
            }
        }
        var obj = JSON.parse(json);

        // copy over stage properties
        stage.attrs = obj.attrs;

        loadNode(this, obj);
        stage.draw();
    };

    /*******************************************************************
     * remove layer from stage
     * @param {Layer} layer
     *******************************************************************/

    stage.remove = function(layer) {

        /*************************************************************
         * remove canvas DOM from the document if
         * it exists
         *************************************************************/

        try {
            stage.content.removeChild(layer.canvas);
        } catch (e) {}
        remove(layer);
    };

    /*******************************************************************
     * bind event listener to container DOM element
     * @param {String} typesStr
     * @param {function} handler
     *******************************************************************/

    stage.onContent = function(typesStr, handler) {
        var types = typesStr.split(' ');
        for (var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            stage.content.addEventListener(baseEvent, handler, false);
        }
    };

    /*******************************************************************
     * add layer to stage
     * @param {Layer} layer
     *******************************************************************/

    stage.add = function(layer) {
        layer.canvas.width = stage.width;
        layer.canvas.height = stage.height;
        _add(layer);

        // draw layer and append canvas to container
        layer.draw();
        stage.content.appendChild(layer.canvas);
    };

    /*******************************************************************
     * get user position (mouse position or touch position)
     * @param {Event} evt
     *******************************************************************/

    stage.getUserPosition = function(evt) {
        return stage.getTouchPosition() || stage.getMousePosition();
    };