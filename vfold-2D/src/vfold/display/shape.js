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
        self.draw(bufferLayer);

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

            self.draw(pathLayer);

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

    self.draw = function(layer) {
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
