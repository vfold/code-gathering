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
