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
            if (child.nodeType === 'Shape' && child.visible && stage.visible) {
                child.draw(child.getLayer());
            } else {
                child.draw();
            }
        }
    };

    /******************************************************
     * add node to container
     * @param {Node} child
     ******************************************************/

    self.add = function(child) {

        child.id = engine.idCounter++;
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
            x: mousePos.x - cont.x,
            y: mousePos.y - cont.y
        }
    }

    return Container;
}, ["Node"]);
