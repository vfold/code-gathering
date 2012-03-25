/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/
var stage = {};
/*****************************************************************
 * Stage with WebGL support.
 *****************************************************************/
stage.init = function() {

    var proto = inherit(new Container()),
        /*****************************************************************
         * Create canvas and check the WebGL context support
         *****************************************************************/
        canvas = document.createElement("canvas");
    
    canvas.setAttribute('style', "border: none;background-color: #333333;width:100%;height:100%;");
    canvas.setAttribute('id', "stage");
    document.body.appendChild(canvas);
    /***************************************************************
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     ***************************************************************/
    if (!window.WebGLRenderingContext) {
        showLink(GET_A_WEBGL_BROWSER);
        return null;
    }
    var gl = create3DContext(canvas);
    if (!gl) {
        showLink(OTHER_PROBLEM);
    }

    function showLink(str) {
        var container = canvas.parentNode;
        if (container) {
            container.innerHTML = makeFailHTML(str);
        }
    }
    /*****************************************************************
     * Initialising Stage
     *****************************************************************/
    var callbacks = [];
    canvas.addResizeCallback = function(func) {
        callbacks.push(func);
    };
    /*****************************************************************
     * On Stage resize callback
     *****************************************************************/
    window.onresize = function() {
        // set the resolution
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }

        gl.flush();
        gl.finish();
    };
    /*****************************************************************
     * Check for extensions and load shaders
     *****************************************************************/
    var vertexShader = {},
        fragmentShader = {},
        name;

    var derivatesExt = "OES_standard_derivatives";
    var derivatesSupported = (gl.getSupportedExtensions().indexOf(derivatesExt) >= 0);

    if (derivatesSupported) {
        gl.getExtension(derivatesExt);
    }

    for (name in shader.fragment) {
        fragmentShader[name] = loadShader(shader.fragment[name], gl.FRAGMENT_SHADER);
    }
    for (name in shader.vertex) {
        vertexShader[name] = loadShader(shader.vertex[name], gl.VERTEX_SHADER);
    }
    /*********************************************************************
     * Loads a Shader dynamically with inspeced attributes and uniforms.
     *********************************************************************/

    function loadShader(shaderSource, shaderType, opt_errorCallback) {
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

        scan(shaderSource, "uniform");
        scan(shaderSource, "attribute");

        function scan(data, type) {
            shader.locations = [];
            while ((start = data.indexOf(type)) != -1) {
                var end = data.indexOf(";", start),
                    declaration = data.substring(start, end),
                    offset = type.length + 1,
                    dataType = declaration.substring(offset, declaration.indexOf(" ", offset)),
                    name = declaration.substring(declaration.lastIndexOf(" ") + 1);
                data = data.substring(end);
                shader.locations.push({
                    "name": name,
                    "type": type,
                    "dataType": dataType
                });
            }

        }
        return shader;
    }


    /*****************************************************
     * location => name(color) , type(vec4)
     *****************************************************/

    function useProgram(program) {
        gl.useProgram();
        for (var location in program.vertex) {
            if (location instanceof WebGLUniformLocation) {
                var items;
                switch (attribute.type) {
                case "vec3":
                    break;
                case "vec2":
                    items = 2;
                    break;
                default:
                    log("DataType needs to be added");
                    break;
                }
                gl.enableVertexAttribArray(attribute);
                gl.vertexAttribPointer(attribute, items, gl.FLOAT, false, 0, 0);
            }
        }
    }
    /******************************************************************
     * Creates the HTLM for a failure message
     * @param {string} canvasContainerId id of container of the
     * canvas.
     * @return {string} The html.
     ******************************************************************/
    var makeFailHTML = function(msg) {
            return '' + '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' + '<td align="center">' + '<div style="display: table-cell; vertical-align: middle;">' + '<div style="">' + msg + '</div>' + '</div>' + '</td></tr></table>';
        };
    /******************************************************************
     * Mesasge for getting a webgl browser
     * @type {string}
     ******************************************************************/
    var GET_A_WEBGL_BROWSER = '' + 'This page requires a browser that supports WebGL.<br/>' + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
    /********************************************************************
     * Mesasge for need better hardware
     * @type {string}
     ********************************************************************/
    var OTHER_PROBLEM = '' + "It doesn't appear your computer can support WebGL.<br/>" + '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
    /********************************************************************
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     * from. If one is not passed in one will be created.
     * @return {!WebGLContext} The created context.
     ********************************************************************/

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
    /********************************************************************
     * Provides requestAnimationFrame in a cross browser way.
     ********************************************************************/
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */
        callback, /* DOMElement Element */
        element) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
    /********************************************************************
     * Provides cancelRequestAnimationFrame in a cross browser way.
     ********************************************************************/
    window.cancelRequestAnimFrame = (function() {
        return window.cancelCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.clearTimeout;
    })();
    /*************************************************************
     * Make the program with a vertex and fragment shader.
     * Behold great magic!
     *************************************************************/

    function Program(name, vertexShader, fragmentShader) {


        if (!(vertexShader && fragmentShader)) {
            error("Cannot find Shader!");
            return;
        }
        /*****************************************************************
         * Setup a GLSL program for Matrix Positioning and Default Pixel
         * Color assignment
         *****************************************************************/
        var program = Program.prototype = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        // Check the link status
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // something went wrong with the link
            error("Error in program linking:" + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        addLocations(vertexShader, "vertex");
        addLocations(fragmentShader, "fragment");

        function addLocations(shader, type) {

            program[type] = {
                "uniform": {},
                "attribute": {}
            };
            /*****************************************************
             * location => name(color) , type(vec4)
             *****************************************************/
            for (var name in shader.location) {
                var loc;
                switch (shader.location[name].type) {
                case "attribute":
                    loc = gl.getAttribLocation(program, name);
                    break;
                case "uniform":
                    loc = gl.getUniformLocation(program, name);
                    break;
                }
                loc.type = shader.location[name].dataType;
                program[type][name] = loc;
            }
        }

        gl.programs[name] = program;
    }
    /********************************************************************
     * Uniform Location
     ********************************************************************/

    function UniformLocation(program, name, type) {

        var p = UniformLocation.prototype = gl.getUniformLocation(program, name);
        this.type = type;
        this.name = name;

        this.set = function(value) {

            switch (type) {
            case "mat3":
                gl.uniformMatrix3fv(p, false, value);
                break;
            }
        };
    }
    /********************************************************************
     * Attribute Location
     ********************************************************************/

    function AttributeLocation() {

        gl.getUniformLocation();

        this.set = function() {

        };
    }
    /********************************************************************
     * Dude, this is the list of Display Objects. Get it?
     ********************************************************************/
    var children = [stage];
    /***********************************************************************
     * This index value will determine where in the array and with what id
     * the added child will be in... Bouyaka!
     ***********************************************************************/
    indexArray = [];
    /********************************************************************
     * Check Display Object Type and add accordingly to the display list
     ********************************************************************/
    stage.add = function(child, container) {
        container || = stage;
        var index = indexArray.length > 0 ? ndexArray.shift() : children.length;

        if (!(child instanceof Child && container instanceof Container && !(containerIds[child]))) {
            log("Cannot add to Stage.\nInvalid DisplayObject: " + child);
            return;
        }
        children[index] = child;
        displayObject.parentId = containerIds[container];
    };
    /**************************************************************************
     * Check Display Object Type and remove accordingly from the display list
     **************************************************************************/
    stage.remove = function(child) {

        if (!((child instanceof Child) && (children[child.id]))) {
            log("Cannot remove from Stage.\nInvalid DisplayObject: " + displayObject);
            return;
        }
        children[index] = null;
        children[child.parentId].;
        indexArray.push(index);
    }
};
