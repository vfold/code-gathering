/*********************************************************************
 * Licensed under the Open Software License version 3.0 *
 * *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the *
 * following licensing notice adjacent to the copyright notice for *
 * the Original Work *
 *********************************************************************/

function Shape() {

    /*******************************************
     * PATH COMMANDS
     * ------------------------------------------
     * Close Path : "Z" , "z"
     * Absolute Move : "M"
     * Relative Move : "m"
     * Absolute Line : "L"
     * Relative Line : "l"
     * Absolute Horizontal Line : "H"
     * Relative Horizontal Line : "h"
     * Absolute Vertical Line : "V"
     * Relative Vertical Line : "v"
     * Absolute Cubic Curve : "C"
     * Relative Cubic Curve : "c"
     * Absolute Smooth Cubic Curve : "S"
     * Relative Smooth Cubic Curve : "s"
     * Absolute Quadratic Curve : "Q"
     * Relative Quadratic Curve : "q"
     * Absolute Smooth Quadratic Curve : "T"
     * Relative Smooth Quadratic Curve : "t"
     * Absolute Elliptical Arc : "A"
     * Relative Elliptical Arc : "a"
     * ------------------------------------------
     * STYLE COMMANDS
     * ------------------------------------------
     * Fill Bitmap : "fb"
     * Fill Color : "fc"
     * Fill Gradient : "fg"
     * Fill Shader : "fs"
     * Fill End : "fe"
     * Line Bitmap : "lb"
     * Line Color : "lc"
     * Line Gradient : "lg"
     * Line Shader : "ls"
     * Line End : "le"
     ********************************************/

    var commands = {
        /****************
         * Path Commands
         ****************/
        "Z": 0,
        "z": 0,
        "M": 1,
        "m": 2,
        "L": 3,
        "l": 4,
        "H": 5,
        "h": 6,
        "V": 7,
        "v": 8,
        "C": 9,
        "c": 10,
        "S": 11,
        "s": 12,
        "Q": 13,
        "q": 14,
        "T": 15,
        "t": 16,
        "A": 17,
        "a": 18,
        /******************
         * Style Commands
         *****************/
        "fb": 19,
        "fc": 20,
        "fg": 21,
        "fs": 22,
        "fe": 23,
        "lb": 24,
        "lc": 25,
        "lg": 26,
        "ls": 27,
        "le": 28
    };

    this.drawPath = function(pathCommands, coordinates) {
        /************************************************
         * Mapping Commands to be readble in the shader
         ***********************************************/
        for (var i = 0; i < commands.length; i++) {
            pathCommands[i] = commands[pathCommands[i]];
        })
}

var p = inherit(new Child()),
    path, /* Color*/
    red = 1,
    green = 1,
    blue = 1,
    alpha = 1;

this.beginFill = function(red, green, blue, alpha) {

    r = red;
    g = green;
    b = blue;;
    a = alpha;
}

// Fills the buffer with the values that define a rectangle.
this.drawRect = function(x1, y1, width, height) {

    var
    x2 = x1 + width,
        y2 = y1 + height;

    path = new Float32Array([
    x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);

    draw();
}

this.bezierTo = function() {

}

function draw() {

    var pr = Program.NORMAL;
    Program.use(Program.NORMAL);

    gl.bindBuffer(gl.ARRAY_BUFFER, p.buffer);
    gl.uniform4f(pr.colorLocation, r, g, b, a);
    gl.bufferData(gl.ARRAY_BUFFER, path, gl.STATIC_DRAW);
    p.compute();
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}
this.lineStyle = function(thickness, color, alpha) {}
this.moveTo = function(x, y) {
    path = [x, y];
}
this.lineTo = function(x, y) {
    path.push(x, y);
}
}