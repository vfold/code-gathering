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
        if (self.visible) {
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
