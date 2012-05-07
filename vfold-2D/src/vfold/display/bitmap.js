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
