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
