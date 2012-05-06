// Licensed under a BSD license. See ../license.html for license
// These funcitions are meant solely to help unclutter the tutorials.
// They are not meant as production type functions.
var gl = {};

gl.init = function() {

    var canvas;

    /**
     * Creates the HTLM for a failure message
     * @param {string} canvasContainerId id of container of the
     * canvas.
     * @return {string} The html.
     */
    var makeFailHTML = function(msg) {
            return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
        };
    /**
     * Mesasge for getting a webgl browser
     * @type {string}
     */
    var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
    /**
     * Mesasge for need better hardware
     * @type {string}
     */
    var OTHER_PROBLEM = '' + "It doesn't appear your computer can support WebGL.<br/>" + '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
    /**
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     * @param {Element} canvas. The canvas element to create a
     * context from.
     * @param {WebGLContextCreationAttirbutes} opt_attribs Any
     * creation attributes you want to pass in.
     * @return {WebGLRenderingContext} The created context.
     */

    function setupWebGL(canvas, opt_attribs) {
        function showLink(str) {
            var container = canvas.parentNode;
            if (container) {
                container.innerHTML = makeFailHTML(str);
            }
        }
        if (!window.WebGLRenderingContext) {
            showLink(GET_A_WEBGL_BROWSER);
            return null;
        }
        var context = create3DContext(canvas, opt_attribs);
        if (!context) {
            showLink(OTHER_PROBLEM);
        }
        return context;
    };
    /**
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     * from. If one is not passed in one will be created.
     * @return {!WebGLContext} The created context.
     */

    function create3DContext(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                context = canvas.getContext(names[ii], opt_attribs);
            } catch (e) {}
            if (context) {
                break;
            }
        }
        return context;
    }
    /**
     * Provides requestAnimationFrame in a cross browser way.
     */
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */
        callback, /* DOMElement Element */
        element) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
    /**
     * Provides cancelRequestAnimationFrame in a cross browser way.
     */
    window.cancelRequestAnimFrame = (function() {
        return window.cancelCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.clearTimeout;
    })();

    /*****************************************************************
     * Check the WebGL context support
     *****************************************************************/

    var canv = document.createElement("canvas");
    canv.setAttribute('style', "border: none;background-color: #333333;width:100%;height:100%;");
    canv.setAttribute('id', "stage");
    document.body.appendChild(canv);

    gl = setupWebGL(canvas = document.getElementById("stage"));

    /**
     * Loads a shader.
     * @param {!WebGLContext} gl The WebGLContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {function(string): void) opt_errorCallback callback for errors.
     * @return {!WebGLShader} The created shader.
     */

    gl.loadShader = function(shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || error;
        // Create the shader object
        var shader = gl.createShader(shaderType);
        // Load the shader source
        gl.shaderSource(shader, shaderSource);
        // Compile the shader
        gl.compileShader(shader);
        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            error("*** Error compiling shader '" + shader + "':" + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        var start;

        scan(shaderSource,"uniform");
        scan(shaderSource,"attribute");
        function scan(data,type){
            shader.location = {};
        while((start = data.indexOf(type))!=-1){
            var end = data.indexOf(";",start),
            declaration = data.substring(start,end);
            offset = type.length+1,
            dataType = declaration.substring(offset,declaration.indexOf(" ",offset)),
            name = declaration.substring(declaration.lastIndexOf(" ")+1),
            data = data.substring(end);
            shader.location[name]={"type":type,"dataType":dataType};
        }

    }

        return shader;
    };


    gl.make2DProjection = function(width, height) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
        2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
    }
    gl.makeTranslation = function(tx, ty) {
        return [
        1, 0, 0, 0, 1, 0, tx, ty, 1];
    }
    gl.makeRotation = function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
        c, -s, 0, s, c, 0, 0, 0, 1];
    }
    gl.makeScale = function(sx, sy) {
        return [
        sx, 0, 0, 0, sy, 0, 0, 0, 1];
    }
    return canvas;
}