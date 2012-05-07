
 /***************************************************** 
  * File path: pre-init.js 
  *****************************************************/ 

 /**********************************************
  * Class definition
  * Make these private and finish fixing it
  **********************************************/

 (function() {

   var queue = {},
     pending = {};

   window.define = function(name, definition, parents) {

     self = {};
     if(window.hasOwnProperty(name)){
      return;
     }
     window[name] = definition(self);

     /**********************************************
      * Helper function for extending Classes
      **********************************************/

     for (var index in parents) {

       var pName = parents[index],
         parent = window[pName];

       if (!parent) {

         queue[name] = {
           definition: definition,
           parents: parents
         }
         if (!pending[pName]) {
           pending[pName] = new Array();
         }
         pending[pName].push(name);

         return;
       }
       put(self, parent.prototype);
     }

     window[name].prototype = self;
   }
 })();
// call super constructor
  function parent(constructor,parameters){
  constructor.apply(arguments.callee.prototype,parameters);
 }

 /***************************************************** 
  * File path: src/vfold/core.js 
  *****************************************************/ 

define("Core",function(self){

	Core = function() {

		var desktop = new Desktop();
		var launcher = new Launcher();
	}

	self = Core.prototype;

return Core;
});

 /***************************************************** 
  * File path: src/vfold/desktop.js 
  *****************************************************/ 
define("Desktop",function(self){

    var Desktop = function() {

		stage.add(this);

		var treeReposition = function() {},
			tree, bg = new Kinetic.Shape({
				drawFunc: function() {

					var w = stage.getWidth(),
						h = stage.getHeight(),
						ctx = this.getContext(),
						grd = ctx.createRadialGradient(w, h, 100, w, h, w);

					grd.addColorStop(0, "#3a4e4e");
					grd.addColorStop(1, "#070e0f");
					ctx.fillStyle = grd;
					ctx.rect(0, 0, w, h);
					ctx.fill();
				}
			});

		this.add(bg);

		loadImage("tree.png", function(image) {

			tree = image;
			log("hey i did it!!");
			this.add(tree);

			treeReposition = function() {
				put(tree.attrs, {
					x: stage.getWidth() - 400,
					y: stage.getHeight() - 400
				});
				this.draw();
			};
			treeReposition();
		});
		stage.addResizeCallback(function() {
			treeReposition();
		});
	}

return Desktop;
},["Layer"]);
 /***************************************************** 
  * File path: src/vfold/display/bitmap.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Bitmap
///////////////////////////////////////////////////////////////////////
/*******************************************************
 * Bitmap constructor
 * @constructor
 * @augments Shape
 * @param {Object} config
 *******************************************************/

define("Bitmap",function(self){

    var Bitmap = function(config) {

        // special
        self.image = config.image;
    };

    self.shapeType = "Bitmap";

    self.drawFunc = function() {
        if (self.image !== undefined) {
            var width = self.width !== undefined ? self.width : self.image.width;
            var height = self.height !== undefined ? self.height : self.image.height;
            var canvas = self.getCanvas();
            var context = self.getContext();
            context.beginPath();
            self.applyLineJoin();
            context.rect(0, 0, width, height);
            context.closePath();
            self.fillStroke();
            context.drawBitmap(self.image, 0, 0, width, height);
        }
    };

    /*******************************************************
     * set width and height
     * @param {Number} width
     * @param {Number} height
     *******************************************************/

    self.setSize = function(width, height) {
        self.width = width;
        self.height = height;
    };

    /*******************************************************
     * return image size
     *******************************************************/

    self.getSize = function() {
        return {
            width: self.width,
            height: self.height
        };
    };
    return Bitmap;
},["Shape"]);

 /**********************************************
  * Callback = function(loadedImage)
  **********************************************/

 function loadBitmap(url,callback) {

   var img = new Image();

   img.onload = function() {
     var bmp = new Bitmap({
       image: img
     });
     callback(bmp);
   }
   img.src = url;
 }

 /***************************************************** 
  * File path: src/vfold/display/container.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Container
///////////////////////////////////////////////////////////////////////
/******************************************************
 * Container constructor.&nbsp; Containers are used to contain nodes or other containers
 * @constructor
 ******************************************************/

define("Container", function(self) {

    var Container = function() {

        self.children = new Array();
        parent(Node);
    };


    /*************************************************
     * get children
     *************************************************/

    self.getChildren = function() {
        return self.children;
    };

    /*************************************************
     * remove all children
     *************************************************/

    self.removeChildren = function() {
        while (self.children.length > 0) {
            self.remove(self.children[0]);
        }
    };

    /************************************************
     * remove child from container
     * @param {Node} child
     ************************************************/

    self.remove = function(child) {
        if (self.children[child.index]._id == child._id) {
            if (stage !== undefined) {
                stage.removeId(child);
                stage.removeName(child);
            }

            for (var n = 0; n < engine.tempNodes.length; n++) {
                var node = engine.tempNodes[n];
                if (node._id === child._id) {
                    engine.tempNodes.splice(n, 1);
                    n = engine.tempNodes.length;
                }
            }

            self.children.splice(child.index, 1);
            self._setChildrenIndices();
            child = undefined;
        }
    };

    /***********************************************************************************
     * return an array of nodes that match the selector.  Use '#' for id selections
     * and '.' for name selections
     * ex:
     * var node = stage.get('#foo'); // selects node with id foo
     * var nodes = layer.get('.bar'); // selects nodes with name bar inside layer
     * @param {String} selector
     ***********************************************************************************/

    var get = function(selector) {
            var arr;
            var key = selector.slice(1);
            if (selector.charAt(0) === '#') {
                arr = stage.ids[key] !== undefined ? [stage.ids[key]] : [];
            } else if (selector.charAt(0) === '.') {
                arr = stage.names[key] !== undefined ? stage.names[key] : [];
            } else {
                return false;
            }

            var retArr = [];
            for (var n = 0; n < arr.length; n++) {
                var node = arr[n];
                if (self.isAncestorOf(node)) {
                    retArr.push(node);
                }
            }

            return retArr;
        };

    /******************************************************
     * determine if node is an ancestor
     * of descendant
     * @param {Node} node
     ******************************************************/

    var isAncestorOf = function(node) {
            if (self.nodeType === 'Stage') {
                return true;
            }

            var parent = node.getParent();
            while (parent) {
                if (parent._id === self._id) {
                    return true;
                }
                parent = parent.getParent();
            }

            return false;
        };

    /******************************************************
     * draw children
     ******************************************************/

    self._drawChildren = function() {
        var children = self.children;
        for (var n = 0; n < children.length; n++) {
            var child = children[n];
            if (child.nodeType === 'Shape' && child.isVisible() && stage.isVisible()) {
                child._draw(child.getLayer());
            } else {
                child._draw();
            }
        }
    };

    /******************************************************
     * add node to container
     * @param {Node} child
     ******************************************************/

    self.add = function(child) {

        child._id = engine.idCounter++;
        child.index = self.children.length;
        child.parent = this;

        self.children.push(child);

        if (stage === undefined) {
            engine.tempNodes.push(child);
        } else {
            stage.addId(child);
            /******************************************************
             * pull in other nodes that are now linked
             * to a stage
             ******************************************************/
            engine._pullNodes(stage);
        }
    };

    /******************************************************
     * set children indices
     ******************************************************/

    var setChildrenIndices = function() {

            /****************************************************************
             * if reordering Layers, remove all canvas elements
             * from the container except the buffer and backstage canvases
             * and then readd all the layers
             ****************************************************************/

            if (self.nodeType === 'Stage') {
                var canvases = self.content.children;
                var bufferCanvas = canvases[0];
                var backstageCanvas = canvases[1];

                self.content.innerHTML = '';
                self.content.appendChild(bufferCanvas);
                self.content.appendChild(backstageCanvas);
            }

            for (var n = 0; n < self.children.length; n++) {
                self.children[n].index = n;

                if (self.nodeType === 'Stage') {
                    self.content.appendChild(self.children[n].canvas);
                }
            }
        };

    /**********************************************
     * Get local mouse position coordinates
     **********************************************/
     
    Container.getMousePos = function(container) {

        var mousePos, cont;

        if (!(mousePos = stage.getMousePosition())) {
            return {
                x: 0,
                y: 0
            };
        }
        cont = container || arguments.callee.prototype;
        return {
            x: mousePos.x - cont.attrs.x,
            y: mousePos.y - cont.attrs.y
        }
    }

    return Container;
}, ["Node"]);

 /***************************************************** 
  * File path: src/vfold/display/drawing.js 
  *****************************************************/ 
var drawing = {

	rect: function(xPos, yPos, width, height, roundCorner) {

		var x = xPos || 0,
			y = yPos || 0,
			w = width || 100,
			h = height || 100,
			r = roundCorner || 0;

	}

};

 /***************************************************** 
  * File path: src/vfold/display/engine.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  engine Object
///////////////////////////////////////////////////////////////////////
/*********************************************************************
 * Kinetic engine Object
 * @property {Object} engineObjet
 *********************************************************************/
var engine = {
    idCounter: 0,
    tempNodes: [],
    animations: [],
    animIdCounter: 0,
    dragTimeInterval: 0,
    maxDragTimeInterval: 20,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        },
        lastDrawTime: 0
    },
    addAnimation: function(anim) {
        anim.id = engine.animIdCounter++;
        this.animations.push(anim);
    },
    removeAnimation: function(id) {
        var animations = this.animations;
        for (var n = 0; n < animations.length; n++) {
            if (animations[n].id === id) {
                this.animations.splice(n, 1);
                return false;
            }
        }
    },
    _pullNodes: function(stage) {
        var go = engine;
        var tempNodes = go.tempNodes;
        for (var n = 0; n < tempNodes.length; n++) {
            var node = tempNodes[n];
            stage._addId(node);
            stage._addName(node);
            go.tempNodes.splice(n, 1);
            n -= 1;
        }
    },
    _runFrames: function() {
        var nodes = {};
        for (var n = 0; n < this.animations.length; n++) {
            var anim = this.animations[n];
            if (anim.node && anim.node._id !== undefined) {
                nodes[anim.node._id] = anim.node;
            }
            anim.func(this.frame);
        }

        for (var key in nodes) {
            nodes[key].draw();
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if (this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        } else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
        if (this.animations.length > 0) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function() {
                that._animationLoop();
            });
        } else {
            this.frame.lastTime = 0;
        }
    },
    _handleAnimation: function() {
        var that = this;
        if (this.animations.length > 0) {
            that._animationLoop();
        } else {
            this.frame.lastTime = 0;
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

 /***************************************************** 
  * File path: src/vfold/display/layer.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/***********************************************************************************
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments sContainer
 * @augments Node
 * @param {Object} config
 ***********************************************************************************/

define("Layer",function(self){

    var Layer = function() {

    self.nodeType = 'Layer';
    self.canvas = document.createElement('canvas');
    self.context = self.canvas.getContext('2d');
    self.canvas.style.position = 'absolute';

    parent(Container);
    }
    /***************************************************************
     * draw children nodes.  this includes any groups
     *  or shapes
     ***************************************************************/

    self.draw = function() {
        self.clear();
        if (self.attrs.visible) {
            self._drawChildren();
        }
    };

    /***************************************************************
     * clears the canvas context tied to the layer.  Clearing
     *  a layer does not remove its children.  The nodes within
     *  the layer will be redrawn whenever the .draw() method
     *  is used again.
     ***************************************************************/

    self.clear = function() {
        self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
    };

return Layer;
},["Container"]);

 /***************************************************** 
  * File path: src/vfold/display/node.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Node
//////////////////////////////////////////////////////////////////////
/********************************************************************************
 * Node constructor.&nbsp; Nodes are entities that can move around
 * and have events bound to them.  They are the building blocks of a KineticJS
 * application
 * @constructor
 * @param {Object} config
 *********************************************************************************/

var Node;

(function() {

    Node = function() {

    }

    var self = Node.prototype;

    /************************************************
     * get zIndex
     ************************************************/

    self.index = undefined;

    /************************************************
     * show / hide node
     ************************************************/

    self.visible = true;
    self.listening = true;
    self.alpha = 1;

    /************************************************
     * set node x position
     * @param {Number} x
     ************************************************/

    self.x = 0;

    /************************************************
     * set node y position
     * @param {Number} y
     ************************************************/

    self.y = 0;
    self.scale = {
        x: 1,
        y: 1
    };

        /**********************************************************************
     * set node rotation in radians
     * @param {Number} theta
     **********************************************************************/

    self.rotation = 0;
    self.centerOffset = {
        x: 0,
        y: 0
    };
    self.dragConstraint = 'none';
    self.dragBounds = {};
    self.draggable = false;
    self.eventListeners = {};

        /**********************************************************************
     * set detection type
     * @param {String} type can be "path" or "pixel"
     **********************************************************************/

     self.detectionType = null;

    /***************************************************************************
     * bind events to the node.  KineticJS supports mouseover, mousemove,
     * mouseout, mousedown, mouseup, click, dblclick, touchstart, touchmove,
     * touchend, dbltap, dragstart, dragmove, and dragend.  Pass in a string
     * of event types delimmited by a space to bind multiple events at once
     * such as 'mousedown mouseup mousemove'. include a namespace to bind an
     * event by name such as 'click.foobar'.
     * @param {String} typesStr
     * @param {function} handler
     ***************************************************************************/

    self.on = function(typesStr, handler) {
        var types = typesStr.split(' ');

        /*********************************************************************
         * loop through types and attach event listeners to
         * each one.  eg. 'click mouseover.namespace mouseout'
         * will create three event bindings
         **********************************************************************/

        for (var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];
            var name = parts.length > 1 ? parts[1] : '';

            if (!self.eventListeners[baseEvent]) {
                self.eventListeners[baseEvent] = [];
            }

            self.eventListeners[baseEvent].push({
                name: name,
                handler: handler
            });
        }
    };

    /**********************************************************************
     * remove event bindings from the node.  Pass in a string of
     * event types delimmited by a space to remove multiple event
     * bindings at once such as 'mousedown mouseup mousemove'.
     * include a namespace to remove an event binding by name
     * such as 'click.foobar'.
     * @param {String} typesStr
     **********************************************************************/

    self.off = function(typesStr) {
        var types = typesStr.split(' ');

        for (var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];

            if (self.eventListeners[baseEvent] && parts.length > 1) {
                var name = parts[1];

                for (var i = 0; i < self.eventListeners[baseEvent].length; i++) {
                    if (self.eventListeners[baseEvent][i] == this) {
                        self.eventListeners[baseEvent].splice(i, 1);
                        if (self.eventListeners[baseEvent].length === 0) {
                            self.eventListeners[baseEvent] = undefined;
                        }
                        break;
                    }
                }
            } else {
                self.eventListeners[baseEvent] = undefined;
            }
        }
    };

    /**********************************************************************
     * determine if shape is visible or not
     **********************************************************************/

    self.isVisible = function() {
        return self.visible;
    };

    /**********************************************************************
     * get absolute z-index by taking into account
     * all parent and sibling indices
     **********************************************************************/

    self.getAbsoluteZIndex = function() {
        var level = self.getLevel();
        var stage = self.getStage();
        var that = this;
        var index = 0;

        function addChildren(children) {
            var nodes = [];
            for (var n = 0; n < children.length; n++) {
                var child = children[n];
                index++;

                if (child.nodeType !== 'Shape') {
                    nodes = nodes.concat(child.getChildren());
                }

                if (child._id === that._id) {
                    n = children.length;
                }
            }

            if (nodes.length > 0 && nodes[0].getLevel() <= level) {
                addChildren(nodes);
            }
        }
        if (that.nodeType !== 'Stage') {
            addChildren(that.getStage().getChildren());
        }

        return index;
    };

    /**********************************************************************
     * get node level in node tree
     **********************************************************************/

    self.getLevel = function() {
        var level = 0;
        var parent = self.parent;
        while (parent) {
            level++;
            parent = parent.parent;
        }
        return level;
    };

    /**********************************************************************
     * set node scale.  If only one parameter is passed in,
     * then both scaleX and scaleY are set with that parameter
     * @param {Number} scaleX
     * @param {Number} scaleY
     **********************************************************************/

    self.setScale = function(scaleX, scaleY) {
        if (scaleY) {
            self.scale.x = scaleX;
            self.scale.y = scaleY;
        } else {
            self.scale.x = scaleX;
            self.scale.y = scaleX;
        }
    };

    /**********************************************************************
     * get scale
     **********************************************************************/

    self.getScale = function() {
        return self.scale;
    };

    /**********************************************************************
     * set node position
     * @param {Number} x
     * @param {Number} y
     **********************************************************************/

    self.setPosition = function(x, y) {
        self.x = x;
        self.y = y;
    };


    /**********************************************************************
     * get detection type
     **********************************************************************/

    self.getDetectionType = function() {
        return self.detectionType;
    };

    /**********************************************************************
     * get node position relative to container
     **********************************************************************/

    self.getPosition = function() {
        return {
            x: self.x,
            y: self.y
        };
    };

    /**********************************************************************
     * get absolute position relative to stage
     **********************************************************************/

    self.getAbsolutePosition = function() {
        return self.getAbsoluteTransform().getTranslation();
    };

    /**********************************************************************
     * set absolute position relative to stage
     * @param {Object} pos object containing an x and
     *  y property
     **********************************************************************/

    self.setAbsolutePosition = function(pos) {

        /*********************************************************************
         * save rotation and scale and
         * then remove them from the transform
         **********************************************************************/

        var rot = self.rotation;
        var scale = {
            x: self.scale.x,
            y: self.scale.y
        };
        var centerOffset = {
            x: self.centerOffset.x,
            y: self.centerOffset.y
        };

        self.rotation = 0;
        self.scale = {
            x: 1,
            y: 1
        };

        //self.move(-1 * self.centerOffset.x, -1 * self.centerOffset.y);
        // unravel transform
        var it = self.getAbsoluteTransform();
        it.invert();
        it.translate(pos.x, pos.y);
        pos = {
            x: self.x + it.getTranslation().x,
            y: self.y + it.getTranslation().y
        };

        self.setPosition(pos.x, pos.y);

        //self.move(-1* self.centerOffset.x, -1* self.centerOffset.y);
        // restore rotation and scale

        self.rotate(rot);
        self.scale = {
            x: scale.x,
            y: scale.y
        };

    };

    /**********************************************************************
     * move node by an amount
     * @param {Number} x
     * @param {Number} y
     **********************************************************************/

    self.move = function(x, y) {
        self.x += x;
        self.y += y;
    };



    self.setRotation = function(theta) {
        self.rotation = theta;
    };

    /**********************************************************************
     * set node rotation in degrees
     * @param {Number} deg
     **********************************************************************/

    self.setRotationDeg = function(deg) {
        self.rotation = (deg * Math.PI / 180);
    };

    /**********************************************************************
     * get rotation in radians
     **********************************************************************/

    self.getRotation = function() {
        return self.rotation;
    };

    /**********************************************************************
     * get rotation in degrees
     **********************************************************************/

    self.getRotationDeg = function() {
        return self.rotation * 180 / Math.PI;
    };

    /**********************************************************************
     * rotate node by an amount in radians
     * @param {Number} theta
     **********************************************************************/

    self.rotate = function(theta) {
        self.rotation += theta;
    };

    /**********************************************************************
     * rotate node by an amount in degrees
     * @param {Number} deg
     **********************************************************************/

    self.rotateDeg = function(deg) {
        self.rotation += (deg * Math.PI / 180);
    };

    /**********************************************************************
     * listen or don't listen to events
     * @param {Boolean} listening
     **********************************************************************/

    self.listen = function(listening) {
        self.listening = listening;
    };

    /**********************************************************************
     * move node to top
     **********************************************************************/

    self.moveToTop = function() {
        var index = self.index;
        self.parent.children.splice(index, 1);
        self.parent.children.push(this);
        self.parent._setChildrenIndices();
    };

    /**********************************************************************
     * move node up
     **********************************************************************/

    self.moveUp = function() {
        var index = self.index;
        self.parent.children.splice(index, 1);
        self.parent.children.splice(index + 1, 0, this);
        self.parent._setChildrenIndices();
    };

    /**********************************************************************
     * move node down
     **********************************************************************/

    self.moveDown = function() {
        var index = self.index;
        if (index > 0) {
            self.parent.children.splice(index, 1);
            self.parent.children.splice(index - 1, 0, this);
            self.parent._setChildrenIndices();
        }
    };

    /**********************************************************************
     * move node to bottom
     **********************************************************************/

    self.moveToBottom = function() {
        var index = self.index;
        self.parent.children.splice(index, 1);
        self.parent.children.unshift(this);
        self.parent._setChildrenIndices();
    };

    /**********************************************************************
     * set zIndex
     * @param {int} zIndex
     **********************************************************************/

    self.setZIndex = function(zIndex) {
        var index = self.index;
        self.parent.children.splice(index, 1);
        self.parent.children.splice(zIndex, 0, this);
        self.parent._setChildrenIndices();
    };

    /**********************************************************************
     * set alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     * @param {Object} alpha
     **********************************************************************/

    self.setAlpha = function(alpha) {
        self.alpha = alpha;
    };

    /**********************************************************************
     * get alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     **********************************************************************/

    self.getAlpha = function() {
        return self.alpha;
    };

    /**********************************************************************
     * get absolute alpha
     **********************************************************************/

    self.getAbsoluteAlpha = function() {
        var absAlpha = 1;
        var node = this;
        // traverse upwards
        while (node.nodeType !== 'Stage') {
            absAlpha *= node.alpha;
            node = node.parent;
        }
        return absAlpha;
    };

    /**********************************************************************
     * enable or disable drag and drop
     * @param {Boolean} isDraggable
     **********************************************************************/

    self.draggable = function(isDraggable) {
        if (self.draggable !== isDraggable) {
            if (isDraggable) {
                initDrag();
            } else {
                dragCleanup();
            }
            self.draggable = isDraggable;
        }
    };

    /**********************************************************************
     * determine if node is currently in drag and drop mode
     **********************************************************************/

    self.isDragging = function() {
        var go = GlobalObject;
        return go.drag.node !== undefined && go.drag.node._id === id && go.drag.moving;
    };

    /**********************************************************************
     * move node to another container
     * @param {Container} newContainer
     **********************************************************************/

    self.moveTo = function(newContainer) {
        var parent = self.parent;
        // remove from parent's children
        parent.children.splice(self.index, 1);
        parent._setChildrenIndices();

        // add to new parent
        newContainer.children.push(this);
        self.index = newContainer.children.length - 1;
        self.parent = newContainer;
        newContainer._setChildrenIndices();
    };

    /**********************************************************************
     * get parent container
     **********************************************************************/

    self.getParent = function() {
        return self.parent;
    };

    /**********************************************************************
     * get layer associated to node
     **********************************************************************/

    self.getLayer = function() {
        if (self.nodeType === 'Layer') {
            return this;
        } else {
            return self.getParent().getLayer();
        }
    };

    /**********************************************************************
     * get stage associated to node
     **********************************************************************/

    self.getStage = function() {
        if (self.nodeType === 'Stage') {
            return this;
        } else {
            if (self.getParent() === undefined) {
                return undefined;
            } else {
                return self.getParent().getStage();
            }
        }
    };

    /**********************************************************************
     * set center offset
     * @param {Number} x
     * @param {Number} y
     **********************************************************************/

    self.setCenterOffset = function(x, y) {
        self.centerOffset.x = x;
        self.centerOffset.y = y;
    };

    /**********************************************************************
     * get center offset
     **********************************************************************/

    self.getCenterOffset = function() {
        return self.centerOffset;
    };

    /**********************************************************************
     * transition node to another state.  Any property that can accept a real
     *  number can be transitioned, including x, y, rotation, alpha, strokeWidth,
     *  radius, scale.x, scale.y, centerOffset.x, centerOffset.y, etc.
     * @param {Object} config
     * @config {Number} [duration] duration that the transition runs in seconds
     * @config {String} [easing] easing function.  can be linear, ease-in, ease-out, ease-in-out,
     *  back-ease-in, back-ease-out, back-ease-in-out, elastic-ease-in, elastic-ease-out,
     *  elastic-ease-in-out, bounce-ease-out, bounce-ease-in, bounce-ease-in-out,
     *  strong-ease-in, strong-ease-out, or strong-ease-in-out
     *  linear is the default
     * @config {Function} [callback] callback function to be executed when
     *  transition completes
     **********************************************************************/

    self.transitionTo = function(config) {
        var node = self.nodeType === 'Stage' ? this : self.getLayer();
        var that = this;
        var go = GlobalObject;
        var trans = new Transition(this, config);
        var anim = {
            func: function() {
                trans.onEnterFrame();
            },
            node: node
        };


        /*********************************************************************
         * adding the animation with the addAnimation
         * method auto generates an id
         **********************************************************************/

        go.addAnimation(anim);

        // subscribe to onFinished for first tween
        trans.tweens[0].onFinished = function() {
            go.removeAnimation(anim.id);
            if (config.callback !== undefined) {
                config.callback();
            }
        };
        // auto start
        trans.start();

        go._handleAnimation();

        return trans;
    };

    /**********************************************************************
     * set drag constraint
     * @param {String} constraint
     **********************************************************************/

    self.setDragConstraint = function(constraint) {
        self.dragConstraint = constraint;
    };

    /**********************************************************************
     * get drag constraint
     **********************************************************************/

    self.getDragConstraint = function() {
        return self.dragConstraint;
    };

    /**********************************************************************
     * set drag bounds
     * @param {Object} bounds
     * @config {Number} [left] left bounds position
     * @config {Number} [top] top bounds position
     * @config {Number} [right] right bounds position
     * @config {Number} [bottom] bottom bounds position
     **********************************************************************/

    self.setDragBounds = function(bounds) {
        self.dragBounds = bounds;
    };

    /**********************************************************************
     * get drag bounds
     **********************************************************************/

    self.getDragBounds = function() {
        return self.dragBounds;
    };

    /**********************************************************************
     * get transform of the node while taking into
     * account the transforms of its parents
     **********************************************************************/

    self.getAbsoluteTransform = function() {
        // absolute transform
        var am = new Transform();

        var family = [];
        var parent = self.parent;

        family.unshift(this);
        while (parent) {
            family.unshift(parent);
            parent = parent.parent;
        }

        for (var n = 0; n < family.length; n++) {
            var node = family[n];
            var m = node.getTransform();

            am.multiply(m);
        }

        return am;
    };

    /**********************************************************************
     * get transform of the node while not taking
     * into account the transforms of its parents
     **********************************************************************/

    self.getTransform = function() {
        var m = new Transform();

        if (self.x !== 0 || self.y !== 0) {
            m.translate(self.x, self.y);
        }
        if (self.rotation !== 0) {
            m.rotate(self.rotation);
        }
        if (self.scale.x !== 1 || self.scale.y !== 1) {
            m.scale(self.scale.x, self.scale.y);
        }

        return m;
    };

    /**********************************************************************
     * initialize drag and drop
     **********************************************************************/

    var initDrag = function() {
            dragCleanup();
            var go = GlobalObject;
            var that = this;
            self.on('mousedown.initdrag touchstart.initdrag', function(evt) {
                var stage = that.getStage();
                var pos = stage.getUserPosition();

                if (pos) {
                    var m = that.getTransform().getTranslation();
                    var am = that.getAbsoluteTransform().getTranslation();
                    go.drag.node = that;
                    go.drag.offset.x = pos.x - that.getAbsoluteTransform().getTranslation().x;
                    go.drag.offset.y = pos.y - that.getAbsoluteTransform().getTranslation().y;
                }
            });
        };

    /**********************************************************************
     * remove drag and drop event listener
     **********************************************************************/

    var dragCleanup = function() {
            self.off('mousedown.initdrag');
            self.off('touchstart.initdrag');
        };

    /**********************************************************************
     * handle node events
     * @param {String} eventType
     * @param {Event} evt
     **********************************************************************/

    var handleEvents = function(eventType, evt) {
            if (self.nodeType === 'Shape') {
                evt.shape = this;
            }
            var stage = self.getStage();
            handleEvent(this, stage.mouseoverShape, stage.mouseoutShape, eventType, evt);
        };

    /**********************************************************************
     * handle node event
     **********************************************************************/

    var handleEvent = function(node, mouseoverNode, mouseoutNode, eventType, evt) {
            var el = node.eventListeners;
            var okayToRun = true;


            /*********************************************************************
             * determine if event handler should be skipped by comparing
             * parent nodes
             **********************************************************************/

            if (eventType === 'onmouseover' && mouseoutNode && mouseoutNode._id === node._id) {
                okayToRun = false;
            } else if (eventType === 'onmouseout' && mouseoverNode && mouseoverNode._id === node._id) {
                okayToRun = false;
            }

            if (el[eventType] && okayToRun) {
                var events = el[eventType];
                for (var i = 0; i < events.length; i++) {
                    events[i].handler.apply(node, [evt]);
                }
            }

            var mouseoverParent = mouseoverNode ? mouseoverNode.parent : undefined;
            var mouseoutParent = mouseoutNode ? mouseoutNode.parent : undefined;

            // simulate event bubbling
            if (!evt.cancelBubble && node.parent.nodeType !== 'Stage') {
                handleEvent(node.parent, mouseoverParent, mouseoutParent, eventType, evt);
            }
        };
       

})();

 /***************************************************** 
  * File path: src/vfold/display/shape.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/*******************************************************************************
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Node
 * @param {Object} config
 * @config {String|CanvasGradient|CanvasPattern} [fill] fill
 * @config {String} [stroke] stroke color
 * @config {Number} [strokeWidth] stroke width
 * @config {String} [lineJoin] line join.  Can be "miter", "round", or "bevel".  The default
 *  is "miter"
 * @config {String} [detectionType] shape detection type.  Can be "path" or "pixel".
 *  The default is "path" because it performs better
 *******************************************************************************/

define("Shape", function(self) {

    var Shape = function(drawFunc) {

            /*******************************************************************************
             * set draw function
             * @param {Function} func drawing function
             *******************************************************************************/

            self.drawFunc = drawFunc;
        };

    /*******************************************************************************
     * set fill which can be a color, gradient object,
     *  or pattern object
     * @param {String|CanvasGradient|CanvasPattern} fill
     *******************************************************************************/

    self.fill = undefined;

    /*******************************************************************************
     * set stroke color
     * @param {String} stroke
     *******************************************************************************/

    self.stroke = undefined;

    /*******************************************************************************
     * set stroke width
     * @param {Number} strokeWidth
     *******************************************************************************/

    self.strokeWidth = undefined;

    /*******************************************************************************
     * set line join
     * @param {String} lineJoin.  Can be "miter", "round", or "bevel".  The
     *  default is "miter"
     *******************************************************************************/

    self.lineJoin = undefined;
    self.detectionType = 'path';

    self.data = [];
    self.nodeType = 'Shape';

    /*******************************************************************************
     * layer context where the shape is being drawn.  When
     * the shape is being rendered, .getContext() returns the context of the
     * user created layer that contains the shape.  When the event detection
     * engine is determining whether or not an event has occured on that shape,
     * .getContext() returns the context of the invisible path layer.
     *******************************************************************************/

    self.getContext = function() {
        return self.tempLayer.getContext();
    };

    /*******************************************************************************
     * Get shape temp layer canvas
     *******************************************************************************/

    self.getCanvas = function() {
        return self.tempLayer.getCanvas();
    };

    /*******************************************************************************
     * helper method to fill and stroke a shape
     *  based on its fill, stroke, and strokeWidth, properties
     *******************************************************************************/

    self.fillStroke = function() {
        var context = self.getContext();

        if (self.fill !== undefined) {
            context.fillStyle = self.fill;
            context.fill();
        }

        var hasStroke = self.stroke !== undefined;
        var hasStrokeWidth = self.strokeWidth !== undefined && self.strokeWidth !== 0;

        if (hasStroke || hasStrokeWidth) {
            var stroke = hasStroke ? self.stroke : 'black';
            var strokeWidth = hasStrokeWidth ? self.strokeWidth : 2;

            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke;
            context.stroke();
        }
    };

    /*******************************************************************************
     * helper method to set the line join of a shape
     * based on the lineJoin property
     *******************************************************************************/

    self.applyLineJoin = function() {
        var context = self.getContext();
        if (self.lineJoin !== undefined) {
            context.lineJoin = self.lineJoin;
        }
    };

    /*******************************************************************************
     * save shape data when using pixel detection.
     *******************************************************************************/

    self.saveData = function() {
        var stage = self.getStage();
        var w = stage.width;
        var h = stage.height;

        var bufferLayer = stage.bufferLayer;
        var bufferLayerContext = bufferLayer.getContext();

        bufferLayer.clear();
        self._draw(bufferLayer);

        var imageData = bufferLayerContext.getImageData(0, 0, w, h);
        self.data = imageData.data;
    };

    /*******************************************************************************
     * clear shape data
     *******************************************************************************/

    self.clearData = function() {
        self.data = [];
    };

    /*******************************************************************************
     * custom isPointInPath method which can use path detection
     * or pixel detection
     *******************************************************************************/

    self.isPointInShape = function(pos) {
        var stage = self.getStage();

        if (self.detectionType === 'path') {
            var pathLayer = stage.pathLayer;
            var pathLayerContext = pathLayer.getContext();

            self._draw(pathLayer);

            return pathLayerContext.isPointInPath(pos.x, pos.y);
        } else {
            var w = stage.width;
            var alpha = self.data[((w * pos.y) + pos.x) * 4 + 3];
            return (alpha !== undefined && alpha !== 0);
        }
    };

    /*******************************************************************************
     * draw shape
     * @param {Layer} layer Layer that the shape will be drawn on
     *******************************************************************************/

    self._draw = function(layer) {
        if (layer !== undefined && self.drawFunc !== undefined) {
            var stage = layer.getStage();
            var context = layer.getContext();
            var family = [];
            var parent = self.parent;

            family.unshift(this);
            while (parent) {
                family.unshift(parent);
                parent = parent.parent;
            }

            context.save();
            for (var n = 0; n < family.length; n++) {
                var node = family[n];
                var t = node.getTransform();

                // center offset
                if (node.centerOffset.x !== 0 || node.centerOffset.y !== 0) {
                    t.translate(-1 * node.centerOffset.x, -1 * node.centerOffset.y);
                }

                var m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }

            if (self.getAbsoluteAlpha() !== 1) {
                context.globalAlpha = self.getAbsoluteAlpha();
            }

            self.tempLayer = layer;
            self.drawFunc.call(this);
            context.restore();
        }
    };

    // Staic methods and properties
    /**********************************************
     * ctx: Context
     * cms: Commands
     * cds: Coordinates
     * pts: Properties
     **********************************************/

    Shape.cmdMap = {

        // Relative Move To
        m: ["moveTo", 2, true],
        // Relative Line to 
        l: ["lineTo", 2, true],
        // Quadratic Relative Curve To
        q: ["quadraticCurveTo", 4, true],
        // Cubic Bezier Curve To
        c: ["bezierCurveTo", 6, true],
        // Arc
        a: ["arc", 6],
        // Begin path
        b: ["beginPath", 0],
        // End path
        e: ["closePath", 0],
        // Fill style
        F: ["fillStyle", -1],
        // Stroke Style
        S: ["strokeStyle", -1],
        // Line Width
        w: ["lineWidth", -1],
        // Fill
        f: ["fill", 0],
        // Stroke
        s: ["stroke", 0]
    };

    Shape.drawPath = function(ctx, cms, cds, pts) {

        // Command arguments
        var args,
        // Coordinate for one command iterator
        y,
        // Command iterator
        i = 0,
            // All Coordinate iterator
            j = 0,
            // Property iterator
            p = 0,
            rel = [0, 0];

        for (i; i < cms.length; i++) {

            /***************************************************
             * Get the command properties from the dictionary
             * when given the next command character from the
             * string
             ***************************************************/

            cm = Shape.cmdMap[cms.charAt(i)];
            switch (cm[1]) {

            case -1:
                ctx[cm[0]] = pts[p++];
                break;
            case 0:
                ctx[cm[0]]();
                break;
            case 2:
            case 4:
            case 6:
                args = new Array(cm[1]);
                for (y = 0; y < cm[1]; y++) {
                    args[y] = cds[j++];
                    if (cm[2] && j > 2) {
                        args[y] += rel[j % 2] += cds[j - 3];
                    }
                }
                ctx[cm[0]].apply(ctx, args);
                break;
            }
        }
    }

    return Shape;
    
}, ["Node"]);

 /***************************************************** 
  * File path: src/vfold/display/stage.js 
  *****************************************************/ 
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

        stageContainer.style.width = "" + width + "px";
        stageContainer.style.height = "" + height + "px";

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
        drawChildren();
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
 /***************************************************** 
  * File path: src/vfold/display/text.js 
  *****************************************************/ 
///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/***************************************************
 * Text constructor
 * @constructor
 * @augments Shape
 * @param {Object} config
 ***************************************************/
var Text;

(function() {

    Text = function(config) {

        /***************************************************
         * font family
         * @param {String} fontFamily
         ***************************************************/
        self.fontFamily = '';

        /***************************************************
         * Text string
         * @param {String} text
         ***************************************************/
        self.text = '';

        /***************************************************
         * font size
         * @param {int} fontSize
         ***************************************************/
        self.fontSize = 12;

        /***************************************************
         * text fill color
         * @param {String} textFill
         ***************************************************/
        self.fill = undefined;

        /***************************************************
         * text stroke color
         * @param {String} textStroke
         ***************************************************/
        self.textStroke = undefined;

        /***************************************************
         * text stroke width
         * @param {int} textStrokeWidth
         ***************************************************/
        self.textStrokeWidth = undefined;

        /*********************************************************************
         * horizontal align of text
         * @param {String} align align can be 'left', 'center', or 'right'
         *********************************************************************/
        self.xAlign = 'left';

        /****************************************************************
         * vertical align of text
         * @param {String} yAlign can be "top", "middle", or "bottom"
         ****************************************************************/
        self.yAlign = 'top';

        /***************************************************
         * padding
         * @param {int} padding
         ***************************************************/
        self.padding = 0;

        /**************************************************************************************
         * font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
         * @param {String} fontStyle
         **************************************************************************************/
        self.fontStyle = 'normal';

        self.shapeType = "Text";

        config.drawFunc = function() {
            var context = self.getContext();
            context.font = self.fontStyle + ' ' + self.fontSize + 'pt ' + self.fontFamily;
            context.textBaseline = 'middle';
            var textHeight = self.getTextHeight();
            var textWidth = self.getTextWidth();
            var p = self.padding;
            var x = 0;
            var y = 0;

            switch (self.xAlign) {
            case 'center':
                x = textWidth / -2 - p;
                break;
            case 'right':
                x = -1 * textWidth - p;
                break;
            }

            switch (self.yAlign) {
            case 'middle':
                y = textHeight / -2 - p;
                break;
            case 'bottom':
                y = -1 * textHeight - p;
                break;
            }

            // draw path
            context.save();
            context.beginPath();
            self.applyLineJoin();
            context.rect(x, y, textWidth + p * 2, textHeight + p * 2);
            context.closePath();
            self.fillStroke();
            context.restore();

            var tx = p + x;
            var ty = textHeight / 2 + p + y;

            // draw text
            if (self.textFill !== undefined) {
                context.fillStyle = self.textFill;
                context.fillText(self.text, tx, ty);
            }
            if (self.textStroke !== undefined || self.textStrokeWidth !== undefined) {
                // defaults
                if (self.textStroke === undefined) {
                    self.textStroke = 'black';
                } else if (self.textStrokeWidth === undefined) {
                    self.textStrokeWidth = 2;
                }
                context.lineWidth = self.textStrokeWidth;
                context.strokeStyle = self.textStroke;
                context.strokeText(self.text, tx, ty);
            }
        };
    };

    self = inherit(Text, new Shape());


    /***************************************************
     * get text width in pixels
     ***************************************************/

    self.getTextWidth = function() {
        return self.getTextSize().width;
    };

    /***************************************************
     * get text height in pixels
     ***************************************************/

    self.getTextHeight = function() {
        return self.getTextSize().height;
    };

    /***************************************************
     * get text size in pixels
     ***************************************************/

    self.getTextSize = function() {
        var context = self.getContext();
        context.save();
        context.font = self.fontStyle + ' ' + self.fontSize + 'pt ' + self.fontFamily;
        var metrics = context.measureText(self.text);
        context.restore();
        return {
            width: metrics.width,
            height: parseInt(self.fontSize, 10)
        };
    };
});

 /***************************************************** 
  * File path: src/vfold/display/transform.js 
  *****************************************************/ 
/*********************************************************
 * Last updated November 2011
 * By Simon Sarris
 * www.simonsarris.com
 * sarris@acm.org
 *
 * Free to use and distribute at will
 * So long as you are nice to people, etc
 **********************************************************/

/*****************************************************************************
 * The usage of this class was inspired by some of the work done by a forked
 * project, KineticJS-Ext by Wappworks, which is based on Simon's Transform
 * class.
 ******************************************************************************/

/**********************************************************
 * Matrix object
 **********************************************************/

var Transform;

(function() {

    Transform = function() {
        this.m = [1, 0, 0, 1, 0, 0];
    }

    var self = Transform.prototype;

    /**********************************************************
     * Apply translation
     * @param {Number} x
     * @param {Number} y
     **********************************************************/

    self.translate = function(x, y) {
        self.m[4] += self.m[0] * x + self.m[2] * y;
        self.m[5] += self.m[1] * x + self.m[3] * y;
    };

    /**********************************************************
     * Apply scale
     * @param {Number} sx
     * @param {Number} sy
     **********************************************************/

    self.scale = function(sx, sy) {
        self.m[0] *= sx;
        self.m[1] *= sx;
        self.m[2] *= sy;
        self.m[3] *= sy;
    };

    /**********************************************************
     * Apply rotation
     * @param {Number} rad  Angle in radians
     **********************************************************/

    self.rotate = function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = self.m[0] * c + self.m[2] * s;
        var m12 = self.m[1] * c + self.m[3] * s;
        var m21 = self.m[0] * -s + self.m[2] * c;
        var m22 = self.m[1] * -s + self.m[3] * c;
        self.m[0] = m11;
        self.m[1] = m12;
        self.m[2] = m21;
        self.m[3] = m22;
    };

    /**********************************************************
     * Returns the translation
     * @returns {Object} 2D point(x, y)
     **********************************************************/

    self.getTranslation = function() {
        return {
            x: self.m[4],
            y: self.m[5]
        }
    };

    /**********************************************************
     * Transform multiplication
     * @param {Kinetic.Transform} matrix
     **********************************************************/

    self.multiply = function(matrix) {
        var m11 = self.m[0] * matrix.m[0] + self.m[2] * matrix.m[1];
        var m12 = self.m[1] * matrix.m[0] + self.m[3] * matrix.m[1];

        var m21 = self.m[0] * matrix.m[2] + self.m[2] * matrix.m[3];
        var m22 = self.m[1] * matrix.m[2] + self.m[3] * matrix.m[3];

        var dx = self.m[0] * matrix.m[4] + self.m[2] * matrix.m[5] + self.m[4];
        var dy = self.m[1] * matrix.m[4] + self.m[3] * matrix.m[5] + self.m[5];

        self.m[0] = m11;
        self.m[1] = m12;
        self.m[2] = m21;
        self.m[3] = m22;
        self.m[4] = dx;
        self.m[5] = dy;
    };

    /**********************************************************
     * Invert the matrix
     **********************************************************/

    self.invert = function() {
        var d = 1 / (self.m[0] * self.m[3] - self.m[1] * self.m[2]);
        var m0 = self.m[3] * d;
        var m1 = -self.m[1] * d;
        var m2 = -self.m[2] * d;
        var m3 = self.m[0] * d;
        var m4 = d * (self.m[2] * self.m[5] - self.m[3] * self.m[4]);
        var m5 = d * (self.m[1] * self.m[4] - self.m[0] * self.m[5]);
        self.m[0] = m0;
        self.m[1] = m1;
        self.m[2] = m2;
        self.m[3] = m3;
        self.m[4] = m4;
        self.m[5] = m5;
    };

    /**********************************************************
     * return matrix
     **********************************************************/

    self.getMatrix = function() {
        return self.m;
    };

});

 /***************************************************** 
  * File path: src/vfold/display/transition.js 
  *****************************************************/ 
/*********************************************************************
 * The Tween class was ported from an Adobe Flash Tween library
 * to JavaScript by Xaric.  In the context of KineticJS, a Tween is
 * an animation of a single Node property.  A Transition is a set of
 * multiple tweens
 **********************************************************************/

var Transition, Tween;

/**********************************************************************
 * Transition constructor.  KineticJS transitions contain
 * multiple Tweens
 * @constructor
 * @param {Node} node
 * @param {Object} config
 **********************************************************************/

(function() {

    Transition = function(node, config) {

        this.node = node;
        this.config = config;
        this.tweens = [];

        // add tween for each property
        for (var key in config) {
            if (key !== 'duration' && key !== 'easing' && key !== 'callback') {
                if (config[key].x === undefined && config[key].y === undefined) {
                    this.add(getTween(key, config));
                }
                if (config[key].x !== undefined) {
                    this.add(getComponentTween(key, 'x', config));
                }
                if (config[key].y !== undefined) {
                    this.add(getComponentTween(key, 'y', config));
                }
            }
        }
    };

    self = Transition.prototype;

    /**********************************************************************
     * add tween to tweens array
     * @param {Tween} tween
     **********************************************************************/

    self.add = function(tween) {
        self.tweens.push(tween);
    };

    /**********************************************************************
     * start transition
     **********************************************************************/

    self.start = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].start();
        }
    };

    /**********************************************************************
     * onEnterFrame
     **********************************************************************/

    self.onEnterFrame = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].onEnterFrame();
        }
    };

    /**********************************************************************
     * stop transition
     **********************************************************************/

    self.stop = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].stop();
        }
    };

    /**********************************************************************
     * resume transition
     **********************************************************************/

    self.resume = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].resume();
        }
    };

    var getTween = function(key) {
            var config = self.config;
            var node = self.node;
            var easing = config.easing;
            if (easing === undefined) {
                easing = 'linear';
            }

            return new Tween(node, function(i) {
                node.attrs[key] = i;
            }, Tweens[easing], node.attrs[key], config[key], config.duration);
        };

    var getComponentTween = function(key, prop) {
            var config = self.config;
            var node = self.node;
            var easing = config.easing;
            if (easing === undefined) {
                easing = 'linear';
            }

            return new Tween(node, function(i) {
                node.attrs[key][prop] = i;
            }, Tweens[easing], node.attrs[key][prop], config[key][prop], config.duration);
        };
})();

(function() {

    /**********************************************************************
     * Tween constructor
     **********************************************************************/

    Tween = function(obj, propFunc, func, begin, finish, duration) {
        listeners = [];
        this.addListener(this);
        this.obj = obj;
        this.propFunc = propFunc;
        this.begin = begin;
        pos = begin;
        this.setDuration(duration);
        this.isPlaying = false;
        change = 0;
        this.prevTime = 0;
        this.prevPos = 0;
        this.looping = false;
        time = 0;
        position = 0;
        startTime = 0;
        finish = 0;
        this.name = '';
        this.func = func;
        this.setFinish(finish);
    };

    /*********************************************************************
     * Tween public methods
     **********************************************************************/

    self = Tween.prototype;

    self.setTime = function(t) {
        self.prevTime = time;
        if (t > self.getDuration()) {
            if (self.looping) {
                self.rewind(t - duration);
                self.update();
                self.broadcastMessage('onLooped', {
                    target: this,
                    type: 'onLooped'
                });
            } else {
                time = duration;
                self.update();
                self.stop();
                self.broadcastMessage('onFinished', {
                    target: this,
                    type: 'onFinished'
                });
            }
        } else if (t < 0) {
            self.rewind();
            self.update();
        } else {
            time = t;
            self.update();
        }
    };

    self.getTime = function() {
        return time;
    };

    self.setDuration = function(d) {
        duration = (d === null || d <= 0) ? 100000 : d;
    };

    self.getDuration = function() {
        return duration;
    };

    self.setPosition = function(p) {
        self.prevPos = pos;
        //var a = self.suffixe != '' ? self.suffixe : '';
        self.propFunc(p);
        //+ a;
        //self.obj(Math.round(p));
        pos = p;
        self.broadcastMessage('onChanged', {
            target: this,
            type: 'onChanged'
        });
    };

    self.getPosition = function(t) {
        if (t === undefined) {
            t = time;
        }
        return self.func(t, self.begin, change, duration);
    };

    self.setFinish = function(f) {
        change = f - self.begin;
    };

    self.getFinish = function() {
        return self.begin + change;
    };

    self.start = function() {
        self.rewind();
        self.startEnterFrame();
        self.broadcastMessage('onStarted', {
            target: this,
            type: 'onStarted'
        });
    };

    self.rewind = function(t) {
        self.stop();
        time = (t === undefined) ? 0 : t;
        self.fixTime();
        self.update();
    };

    self.fforward = function() {
        time = duration;
        self.fixTime();
        self.update();
    };

    self.update = function() {
        self.setPosition(self.getPosition(time));
    };

    self.startEnterFrame = function() {
        self.stopEnterFrame();
        self.isPlaying = true;
        self.onEnterFrame();
    };

    self.onEnterFrame = function() {
        if (self.isPlaying) {
            self.nextFrame();
        }
    };

    self.nextFrame = function() {
        self.setTime((self.getTimer() - startTime) / 1000);
    };

    self.stop = function() {
        self.stopEnterFrame();
        self.broadcastMessage('onStopped', {
            target: this,
            type: 'onStopped'
        });
    };

    self.stopEnterFrame = function() {
        self.isPlaying = false;
    };

    self.continueTo = function(finish, duration) {
        self.begin = pos;
        self.setFinish(finish);
        if (duration !== undefined) self.setDuration(duration);
        self.start();
    };

    self.resume = function() {
        self.fixTime();
        self.startEnterFrame();
        self.broadcastMessage('onResumed', {
            target: this,
            type: 'onResumed'
        });
    };

    self.yoyo = function() {
        self.continueTo(self.begin, time);
    };

    self.addListener = function(o) {
        self.removeListener(o);
        return listeners.push(o);
    };

    self.removeListener = function(o) {
        var a = listeners;
        var i = a.length;
        while (i--) {
            if (a[i] == o) {
                a.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    self.broadcastMessage = function() {
        var arr = [],i;
        for (i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
        var e = arr.shift();
        var a = listeners;
        var l = a.length;
        for (i = 0; i < l; i++) {
            if (a[i][e]) {
                a[i][e].apply(a[i], arr);
            }
        }
    };

    self.fixTime = function() {
        startTime = self.getTimer() - time * 1000;
    };

    self.getTimer = function() {
        return new Date().getTime() - time;
    };
})();

Tweens = {
    backEaseIn: function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    backEaseOut: function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    backEaseInOut: function(t, b, c, d, a, p) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    elasticEaseIn: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    elasticEaseOut: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    elasticEaseInOut: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) == 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    bounceEaseOut: function(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    bounceEaseIn: function(t, b, c, d) {
        return c - Tweens.bounceEaseOut(d - t, 0, c, d) + b;
    },
    bounceEaseInOut: function(t, b, c, d) {
        if (t < d / 2) {
            return Tweens.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        } else {
            return Tweens.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    easeIn: function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOut: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    strongEaseIn: function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    strongEaseOut: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    strongEaseInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    linear: function(t, b, c, d) {
        return c * t / d + b;
    }
};

 /***************************************************** 
  * File path: src/vfold/launcher.js 
  *****************************************************/ 
define("Shape", function(self) {

	// Background shape for the launcher
	var bg = new Shape({
		drawFunc: function() {}
	}),
		// Launcher container
		lCont = new Layer(),
		// Dummy background for mouse movement
		dummyBg = new Shape(drawing.rect),
		//
		apps,
		//
		appActive,
		// Number of applications pinned to launcher
		numApps = 5,
		// Tab Normal Size
		size = 50,
		// Application Launcher width
		lWidth = numApps * size,
		// Corner Radius
		rd = 6,
		// Tab zoomed size
		zoomSize = 10;

	var Launcher = function() {

			stage.add(this);

			put(dummyBg.attrs, {
				width: lWidth,
				height: size + zoomSize,
				fill: "black",
				alpha: 0.5
			});

			stage.addResizeCallback(function() {
				put(self.attrs, {
					x: (stage.getWidth() - lWidth) >> 1
				});
			});

			dummyBg.on("mousemove", function() {

				drawBg();
			});
		};

	var drawBg = function() {

			// Get context for drawing
			var ctx = bg.getContext(),
				// Properties
				pts = ["#FF0000"],
				// Draw path commands
				cmd = "bFmlqlqlqlqlqlqlqlqlcf",
				// Draw path coordinates
				crds = new Int16Array(52),
				// Local mouse position
				mPos = getLocalMousePos(self),
				// The ratio of mouse related position to launcher's tab 
				moveRatio,
				// Application Launcher's local mouse position ratio 
				lPosRatio = mPos.x / size,
				//
				appOver = Math.ceil(lPosRatio),
				//
				appRatio = 1 + lPosRatio - appOver,
				// Left tab size difference from original tab size 
				leftTabDiff,
				// Right tab size difference from original tab size  
				rightTabDiff,
				// Gap between left corner and left tab
				leftGap = (size * appOver) - (rd << 1),
				// Gap between right tab and right corner
				rightGap = (size * appOver) - (rd << 1),
				// Left Commands: [mlqlqlql] qlqlqlqlql
				leftCrds,
				// Tab separator Commands: mlqlqlql [qlq] lqlqlql
				sepCrds,
				// Right Commands: mlqlqlqlqlq [lqlqlql]
				rightCrds;

			/************************************************
			 * Calculating the coordinates for path drawing
			 ************************************************/

			// Check if mouse is on the right half side of the tab
			if (isRight == (appRatio > 0.5)) {

				moveRatio = 1.5 - appRatio;
				leftTabDiff = zoomSize * moveRatio;
				rightTabDiff = zoomSize * (1 - moveRatio);

				rightGap -= rightTabDiff;

				sepCrds = [
				rd, 0, 0, -rd, // Start Corner
				0, -rightTabDiff, // Line Up to start of right tab
				0, -rd, 0, rd // End Corner		
				];

				// mouse is on the left half side of the tab
			} else {

				moveRatio = appRatio + 0.5;
				leftTabDiff = zoomSize * (1 - moveRatio);
				rightTabDiff = zoomSize * moveRatio;

				leftGap += leftTabDiff;

				sepCrds = [
				rd, 0, 0, -rd, // Start Corner
				0, rightTabDiff, // Line Down to start of right tab
				0, -rd, 0, rd // End Corner		
				];
			}


			/****************************************************
			 * Left part before reaching tab separator
			 * Commands: [mlqlqlql]qlqlqlqlql
			 ****************************************************/

			leftCrds = [
			0, 0, //Move Tos
			0, size - rd, // Line To
			0, rd, rd, 0, // Left Corner of application launcher
			leftGap, 0, // Up until extending tab 
			rd, 0, 0, rd, // Corner of Left tab
			0, leftTabDiff - rd, // Left tab extension
			0, rd, rd, 0, // Bottom Left Tab corner
			(leftTabDiff + size) - (rd << 1), 0 // Line across tab
			];

			/****************************************************
			 * Right part after tab separator
			 * Commands: mlqlqlqlqlq[lqlqlql]
			 ****************************************************/

			rightCrds = [
			(rightTabDiff + size) - (rd << 1), 0, // Line for right tab
			rd, 0, 0, -rd, // Bottom-right right tab corner
			0, -rightTabDiff, // right side tab line 
			0, -rd, rd, 0, // Top-right right tab corner
			rightGap, 0, // After right extending tab
			rd, 0, 0, -rd, // Far right corner
			0, rd - size // Up to the top again
			];

			/****************************************************
			 * Adding the coordinates
			 ****************************************************/

			crds.set(leftCrds, 0);
			crds.set(sepCrds, 21);
			crds.set(rightCrds, 31);

			drawPath(ctx, cmd, crds, pts);
		};

	lCont.add(bg);
	self.add(lCont);
	self.add(dummyBg);

	return Launcher;
}, ["Layer"]);

 /***************************************************** 
  * File path: init.js 
  *****************************************************/ 
 var global = {};

 window.onload = function() {

   stage.init();

   new Core();

   window.onresize();
 }

 /*********************************************
  * Wrapped logging function.
  * @param {string} msg The message to log.
  *********************************************/

 function log(msg) {
   if (window.console && window.console.log) {
     window.console.log(msg);
   }
 };

 /**********************************************
  * Wrapped logging function.
  * @param {string} msg The message to log.
  **********************************************/

 function error(msg) {
   if (window.console) {
     if (window.console.error) {
       window.console.error(msg);
     } else if (window.console.log) {
       window.console.log(msg);
     }
   }
 };

 /**********************************************
  * Add or change values to object
  **********************************************/

 function put(object, values) {
   for (var key in values) {
     object[key] = values[key];
   }
 }


