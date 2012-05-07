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
