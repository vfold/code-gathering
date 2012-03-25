
 /***************************************************** 
  * File path: src/common/event.js 
  *****************************************************/ 
//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License

function EventDispatcher(){
    this._listeners = {};
}

EventDispatcher.prototype = {

    addListener:function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },

    dispatch:function(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }

        if (!event.type){
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }
    },

    removeListener:function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = _listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }
};
 /***************************************************** 
  * File path: src/vfold/tool/workspaceList.js 
  *****************************************************/ 

 /***************************************************** 
  * File path: src/vfold/display/container.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Container() {

    var p = Class.prototype;

    function Class() {

        this.children = [];
        this.childrenIDs = [];
    }

    /************************************************
     * Add Child to the container
     *************************************************/

    p.addChild = function(child) {
        this.childrenIDs[child.id] = child;
        child.index = this.children.length;
        child.parent = this;
        this.children.push(child);
    }

    /************************************************
     * Remove Display Object Child from the container
     *************************************************/

    p.removeChild = function(child) {
        this.childrenIDs[child.id] = undefined;
        this.children.splice(child.index, 1);
        setChildrenIndices();
        child = undefined;
    }

    /************************************************
     * Add Child at a specified index
     *************************************************/

    p.addChildAt = function(child, index) {
        this.childrenIDs[child.id] = child;
        child.index = index;
        child.parent = this;
        this.children.splice(index, 0, child);
        setChildrenIndices();
    }

    /************************************************
     * Remove Child from a specific index
     *************************************************/

    p.removeChildAt = function(index) {
        var child = this.children[index];
        this.childrenIDs[child.id] = undefined;
        this.children.splice(index, 1);
        setChildrenIndices();
        child = undefined;
    }
    /************************************************
     * Reorder Children based on their array index
     *************************************************/

    function setChildrenIndices() {
        for (var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;
        }
    }
}
 /***************************************************** 
  * File path: src/vfold/display/stage.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/*****************************************************************
 * Stage with WebGL support.
 *****************************************************************/

var stage = {};
stage.init = function() {
    /*****************************************************************
     * Create canvas and check the WebGL context support
     *****************************************************************/
    stage = document.createElement("canvas");
    stage.setAttribute('style', "border: none;background-color: #333333;width:100%;height:100%;");
    stage.setAttribute('id', "stage");
    document.body.appendChild(stage);
    /***************************************************************
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     ***************************************************************/
    if (!window.WebGLRenderingContext) {
        showLink(GET_A_WEBGL_BROWSER);
        return null;
    }
    var gl = create3DContext(stage);
    if (!gl) {
        showLink(OTHER_PROBLEM);
    }

    function showLink(str) {
        var container = stage.parentNode;
        if (container) {
            container.innerHTML = makeFailHTML(str);
        }
    }
    /*****************************************************************
     * Initialising Stage
     *****************************************************************/
    var callbacks = [];
    stage.addResizeCallback = function(func) {
        callbacks.push(func);
    };
    /*****************************************************************
     * On Stage resize callback
     *****************************************************************/
    window.onresize = function() {
        // set the resolution
        stage.width = window.innerWidth;
        stage.height = window.innerHeight;
        gl.viewport(0, 0, stage.width, stage.height);
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
    stage.useProgram = function(program) {
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
    };
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

    function UniformLocation(program,name,type) {

        var p = UniformLocation.prototype = gl.getUniformLocation(program,name);
        this.type = type;
        this.name = name;

        this.set = function(value) {

            switch(type){
                case "mat3":
                    gl.uniformMatrix3fv(p,false,value);
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
};

 /***************************************************** 
  * File path: src/vfold/display/location.js 
  *****************************************************/ 
function Uniform(uniformLocation){



this.set = function(){

}
}
function Attribute(){

}
 /***************************************************** 
  * File path: src/vfold/display/sprite.js 
  *****************************************************/ 

 /***************************************************** 
  * File path: src/vfold/display/child.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Child() {

    var /* Deformation Matrices*/
    transformationMatrix = [0, 0, 0, 1, 1, 0, 0, 0, 0];

    this.buffer = gl.createBuffer();
    
    // Set the matrix.
    

    function render(){

        gl.uniformMatrix3fv(Program.NORMAL.vertex.matrix, false, transformationMatrix);
        gl.uniformMatrix3fv(Program.NORMAL.vertex.matrix, false, rotationMatrix);
    }

    /******************************************************************
     * Tranformation Setters and Getters
     ******************************************************************/

    this.setRotation = function(value) {
        transformationMatrix[6] = value;
    }
    this.setScaleX = function(value) {
        transformationMatrix[3] = value;
    }
    this.setScaleY = function(value) {
        transformationMatrix[4] = value;
    }
    this.setX = function(value) {
        transformationMatrix[0] = value;
    }
    this.setY = function(value) {
        transformationMatrix[1] = value;
    }
    this.getX = function() {
        return transformationMatrix[0];
    }
    this.getY = function() {
        return transformationMatrix[1];
    }
    this.getScaleX = function() {
        return transformationMatrix[3];
    }
    this.getScaleY = function() {
        return transformationMatrix[4];
    }
    this.getRotation = function() {
        return transformationMatrix[6];
    }
}

 /***************************************************** 
  * File path: src/vfold/display/shape.js 
  *****************************************************/ 
/*********************************************************************
* Licensed under the Open Software License version 3.0 *
* *
* This Open Software License (OSL-3.0) applies to any original work *
* of authorship "vfold" whose owner Raphael Varonos has placed the *
* following licensing notice adjacent to the copyright notice for *
* the Original Work *
*********************************************************************/

function Shape() {

        var p = inherit(new Child()),
        path,

        /* Color*/
        r = 1,
        g = 1,
        b = 1,
        a = 1;

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
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]);

            draw();
        }
        
        this.bezierTo = function(){
            
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
 /***************************************************** 
  * File path: src/vfold/workspace.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

    /********************************************
     * The workspace contains the main layers:
     * Folders, Widgets, Desktop, Panel
     ********************************************/

    function Workspace() {

        var p = Class.prorotype;

        /***************************************
         * Components
         ***************************************/

        var dicFolders = [],
            dicTools = [],
            dicWidgets = [],
            dicDesktops = [];

        function Class() {

        }

        p.title = "Untitled";

        p.menu = new MenuOptions;

        p.getFolders = function() {
            return dicFolders;
        };
        p.getTools = function() {
            return dicTools;
        };
        p.getWidgets = function() {
            return dicWidgets;
        };
        p.getDesktops = function() {
            return dicDesktops;
        };

        p.getComponent = function(classPath) {

            var
            f = dicFolders[classPath],
                d = dicDesktops[classPath],
                w = dicWidgets[classPath],
                t = dicTools[classPath];

            return f ? f : d ? d : w ? w : t ? t : null;
        };


        p.setComponent = function(component) {

            var t = WorkspaceComponent.type;

            switch (component.type) {

            case t.DESKTOP:
                component.initOnce = true;
                dicDesktops[component.class_path] = component;
                break;

            case t.FOLDER:

                var parent = menu;
                var titles = component.menu_path.split(".");
                for (var i;
                i < titles.length;
                i++) {
                    var title = titles[i];
                    var child = parent.children[title];
                    if (!child) {
                        child = new MenuOptions();
                        child.title = title;
                        if (i == titles.length - 1) {
                            child.launch = component.class_path;
                        }
                        parent.setChild(child);
                    }
                    parent = child;
                }
                dicFolders[component.class_path] = component;
                break;

            case t.WIDGET:

                dicWidgets[component.class_path] = component;
                break;

            case t.TOOL:
                component.initOnce = true;
                dicTools[component.class_path] = component;
                break;

            default:
                alert("Unrecognized type");
                break;

            }
        };
        Workspace = Class;
    }

    /********************************************************
     * Workspace Layers:
     * Folders, Desktop, Panel, Widgets
     ********************************************************/

    function WorkspaceLayer() {

        var p = new Kinetic.Layer("WorkspaceLayer");
        p.constructor = Class;

        function Class() {

            this.dispatcher = new EventDispatcher();
        }

        WorkspaceLayer = Class;
    }

    /********************************************************
     * Workspace Component Handler where external libraries
     * are loaded and instantiated appropriately 
     ********************************************************/

    function WorkspaceComponent() {

        const instances = [];
        var initOnce = false;

        function Class(component) {

        }

        Class.instantiate = function(classPath, onInstantiate) {

            var appDomain = new ApplicationDomain(VFOLD.appDomain);
            var comp = Core.currentWorkspace.getComponent(classPath);
            if (!comp) {
                alert("Component not found!");
                return;
            }
            var vobLib;
            // Dependency Loaded Count
            var dlc = 0;

            init();

            function init() {

                if (appDomain.hasDefinition(comp.class_path)) {

                    if (comp.initOnce && comp.instances.length > 0) {
                        onInstantiate(comp.instances[0]);
                    }
                    else {
                        var compClass = appDomain.getDefinition(comp.class_path),
                            inst = new compClass;
                        inst.name = comp.title;
                        onInstantiate(inst);
                    }

                }
                else if (vobLib) {

                    if (vobLib.dependencies.length > 0) {

                        for (var dependency in vobLib.dependencies) {
                            if (Core.libraries[dependency]) onDependencyLoaded();

                            else {

                                /***********************************************************
                                 * Get Dependency from Database
                                 ***********************************************************/

                                Core.appCall("Library.getByName", function(library) {
                                    loadLibrary(library.data, onDependencyLoaded);
                                }, [dependency]);
                            }
                        }
                    }
                    else {

                        loadLibrary(vobLib.data, onLibraryLoaded)
                    }
                }
                else if (!comp.libraryTitle) {

                    alert("Library ID not specified");
                }
                else {
                    /***********************************************************
                     * Get Library from Database
                     ***********************************************************/

                    Core.appCall("Library.get", function(library) {
                        vobLib = library;
                        init();
                    }, [comp.libraryTitle]);
                }
            }

            function loadLibrary(libraryData, onLibraryLoaded) {

                var rsl = new Loader();
                rsl.contentLoaderInfo.addEventListener(Event.COMPLETE, function() {

                    onLibraryLoaded();
                });
                rsl.loadBytes(libraryData, new LoaderContext(false, appDomain));
            }

            function onDependencyLoaded() {

                dlc++;
                if (dlc == vobLib.dependencies.length) {
                    dlc = 0;
                    loadLibrary(vobLib.data, onLibraryLoaded);
                }
            }

            function onLibraryLoaded() {

                vobLib = null;
                init();
            }

            WorkspaceComponent = Class;
        }
    }
 /***************************************************** 
  * File path: src/vfold/layer/desktop.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/
 
    function Desktop(){
    Class.prototype = new Container();
    Class.prototype.constructor = Class;

}
 /***************************************************** 
  * File path: src/vfold/layer/folders.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/


function Folders() {

    var p = new Container(),

        /*********************************
         *  Workspace Containers
         *********************************/
        wrkContainers = [],
        /*********************************
         *  Active Folder
         *********************************/
        actFolder,
        /*********************************
         *  Folder Tabs
         *********************************/
        fldTabs;

        this.dispatcher = new EventDispatcher();

    function onTabClose() {
        removeFolder(fldTabs.currentData);
    }

    function onTabSelect() {
        selectFolder(fldTabs.currentData);
    }

    function selectFolder(folder) {
        if (wSpace.numChildren > 0) Folder(wSpace.getChildAt(wSpace.numChildren - 1)).active = false;
        folder.active = true;
        fldTabs.selectTab(folder);
        actFolder = folder;
        wSpace.addChildAt(folder, wSpace.numChildren);
        dispatchEvent(new Event(FOLDER_SELECT));
    }

    p.constructor = Class;

    p.init = function() {

        // This is a dummy dashboard workspace
        this.add(new Kinetic.Layer());
        this.dispatcher.addListener(VFoldEvents.FOLDER_SELECT, function() {
            p.selectFolder(Folder(e.target));
        });

        fldTabs = new Tabs(Panel.CONTENT_HEIGHT / 2 - 3, VFold.color, .7, onTabSelect, onTabClose);
        fldTabs.y = PanelHandler.CONTENT_HEIGHT - fldTabs.height;
        addChild(fldTabs);

        VFold.addResizeCallback(function() {
            fldTabs.adjust(stage.width - x);
        });
    }

    p.addFolder = function(classPath) {
        WorkspaceComponent.instantiate(classPath, function(instance) {
            var f = instance;
            fldTabs.addTab(f.name, f);
            dispatchEvent(new Event(FOLDER_CREATE));
            selectFolder(f);
        });
    }

    p.removeFolder = function(folder) {
        actFolder = folder;
        wSpace.removeChild(folder);
        dispatchEvent(new Event(FOLDER_CLOSING));
        if (wSpace.numChildren > 0) Folder(wSpace.getChildAt(wSpace.numChildren - 1)).active = true;
    }

    p.closeFolder = function(folder) {
        fldTabs.removeTabByData(folder);
        removeFolder(folder);
    }

    p.selectFolder = selectFolder;

    p.getFolderBar = function() {
        return fldTabs
    }
    p.getActiveFolder = function() {
        return actFolder
    }

    p.onWorkspaceChange = function() {
        this.remove(0);
        this.add(wrkContainers[Core.currentWorkspaceIndex]);
    }

    function onWorkspaceAdd() {
        wrkContainers.push(new Kinetic.Container());
    }

    function getCurrentContainer() {
        return wrkContainers[Core.currentWorkspaceIndex]
    }
}
 /***************************************************** 
  * File path: src/vfold/layer/panel.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Panel() {
    
    var p = new Container();
    p.constructor = Class;

    var menuLauncher, menu_, toolbar_;

    var folderBar,

    CONTENT_GAP = 3, LOADER_BAR_HEIGHT = 3, CONTENT_HEIGHT;

    function Class() {
        
        menuLauncher = new PanelMenuLauncher()
        menu_  = new Menu();
        PanelToolBar = new PanelToolbar();
        CONTENT_HEIGHT = VFold.PANEL_HEIGHT - LOADER_BAR_HEIGHT

    }

    p.init = function() {
        const background = new PanelBackground;

        folderBar = Core.folderHandler.folderBar;
        menu_.x = menu_.gap;
        menu_.y = VFOLD.PANEL_HEIGHT + menu_.gap;
        menu_.onMenuButtonDown = function(btn) {
            Core.folderHandler.addFolder(btn.options.launch);
        };

        p.add(background);
        p.add(menuLauncher);
        p.add(folderBar);
        p.add(toolbar_);
        p.add(menu_);

        mouseEnabled = false;

        VFOLD.onStageResize = function() {
            background.draw();
        }
    }
    p.addTool = function(tool) {
        toolbar_.addTool(tool)
    }
    p.onWorkspaceChange = function() {
        // Default Logo
        var
        bmpDEF = Core.defaultWorkspace.menu.icon,
            bdtCUR = Core.currentWorkspace.menu.icon;

        menu_.addButtons(Core.currentWorkspace.menu.children);
        menuLauncher.changeLogo(bdtCUR ? bdtCUR : bmpDEF);

        toolbar_.x = folderBar.x = menuLauncher.width;
        toolbar_.onStageResize();
    }

    p.getMenu = function() {
        return menu_
    }
    p.getToolbar = function() {
        return toolbar_
    }


    function PanelBackground() {

        var p = Class.prototype;
        p = new Kinetic.Group();
        p.constructor = Class;

        // Background
        var bg = new Kinetic.Shape("panelBackground");
        // Loader Line TODO: Make a Sync/ASync PreLoader
        var ln = new Kinetic.Shape("panelLoader");
        // Shadow
        var sh = new Kinetic.Shape("shadow");

        const gt = GradientType.LINEAR;
        var m = new Matrix;

        function Class() {

            bg.alpha = .8;
            addChild(bg);
            addChild(sh);
            addChild(ln);
            mouseEnabled = mouseChildren = false;
            ln.y = PanelHandler.CONTENT_HEIGHT;
            sh.y = VFOLD.PANEL_HEIGHT;
        }
        p.draw = function() {
            var g;
            /*********************************
             *  Background
             *********************************/
            g = bg.getContext();
            g.clear();
            g.beginFill(VFOLD.color, .7);
            g.drawRect(0, 0, VFOLD.stage.stageWidth, PanelHandler.CONTENT_HEIGHT);
            g.endFill();
            /*********************************
             *  Shadow
             *********************************/
            g = sh.getContext();
            g.clear();
            m.createGradientBox(VFOLD.stage.stageWidth, 20, Math.PI / 2);
            g.beginGradientFill(gt, [0, 0], [.7, 0], [0, 255], m);
            g.drawRect(0, 0, VFOLD.stage.stageWidth, 20);
            g.endFill();
            /*********************************
             *  Loader Line
             *********************************/
            g = ln.getContext();
            g.clear();
            g.beginFill(UtilityColor.brightness(VFOLD.color, .7));
            g.drawRect(0, 0, VFOLD.stage.stageWidth, PanelHandler.LOADER_BAR_HEIGHT);
            g.endFill();
        }
        return Class;
    }

    function PanelMenuLauncher() {

        var p = new Kinetic.Group();
        p.constructor = Class;

        // Clicked Boolean
        var cB = false;
        // Tween Max
        var TM;
        // Logo Bitmap
        var bL = VFold.call("System.getImage","menu");
        // Height
        var h;

        function Class() {


            var c = UtilityColor.hexToRGB(VFOLD.color);
            TweenMax.to(bL, 0, {
                colorTransform: {
                    redOffset: c.red,
                    greenOffset: c.green,
                    blueOffset: c.blue
                }
            });
            addChild(bL);
            h = PanelHandler.CONTENT_HEIGHT;
            x = 5;
            alpha = .8;

            addEventListener(MouseEvent.MOUSE_OVER, onBtnOver);
            addEventListener(MouseEvent.MOUSE_OUT, onBtnOut);
            addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);

            TweenMax.to(this, 0, {
                glowFilter: {
                    color: 0xFFFFFF,
                    blurX: 30,
                    blurY: 7,
                    alpha: 1,
                    strength: 1.3
                }
            });
            TM = TweenMax.to(this, .15, {
                paused: true,
                glowFilter: {
                    blurX: 7,
                    blurY: 7,
                    alpha: 1
                }
            });
        }
        p.changeLogo = function(logo) {
            if (logo) bL.bitmapData = logo.bitmapData;
            y = (height - bL.height) / 2;
        }

        function onMouseDown() {
            if (cB) {
                cB = false;
                Core.panelHandler.menu.fadeOut();
                onBtnOut();
                VFOLD.stage.removeEventListener(MouseEvent.MOUSE_DOWN, onStageDown);
                addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
            }
            else {
                onBtnOver();
                Core.panelHandler.menu.fadeIn();
                cB = true;
                VFOLD.stage.addEventListener(MouseEvent.MOUSE_DOWN, onStageDown);
                removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
            }
        }

        function onStageDown() {
            if (e.target != this) {
                onMouseDown()
            }
        }

        function onBtnOver() {
            if (!cB) TM.play()
        }

        function onBtnOut() {
            if (!cB) TM.reverse()
        }

        p.getWidth = function() {
            return x * 2 + this.width
        }
        p.getHeight = function() {
            return h
        }

    }

    function PanelToolBar() {

        var p = Class.prototype;
        p = new Kinetic.Group();
        p.constructor = Class;


        // Left Container
        var lc = new Kinetic.Group();
        // Right Container
        var rc = new Kinetic.Group();
        // Width
        var w;
        // Height
        var h;
        // Tool Gap
        const g = 2;

        /******************************************
         * GLOBAL TOOLS *
         ******************************************/

        // Workspace Switcher Tool
        var ws;

        function Class() {

            y = CONTENT_GAP;
            h = (CONTENT_HEIGHT - CONTENT_GAP) / 2 - CONTENT_GAP;
            addEventListener(Tool.TOOL_CHANGE, onToolChange);

            ws = new WorkspaceSwitcher();
            addTool(ws);
            addChild(lc);
            addChild(rc);

            VFOLD.onStageResize = onStageResize;
        }

        p.onStageResize = function() {
            w = VFOLD.stage.stageWidth - x - CONTENT_GAP - g;
            rc.x = w;
            dispatchEvent(new Event(DropBox.ADJUST_OFFSET));
        }

        function onToolChange(e) {
            var t = Tool(e.target);
            var i;
            switch (t.align) {
            case Tool.ALIGN_LEFT:
                for (i = 0; i < lc.numChildren; i++) {
                    if (i != 0) lc.getChildAt(i).x = lc.getChildAt(i - 1).x + lc.getChildAt(i - 1).width + g;
                    else lc.getChildAt(i).x = g;
                }
                break;
            case Tool.ALIGN_RIGHT:
                for (i = 0; i < rc.numChildren; i++) {
                    if (i != 0) rc.getChildAt(i).x = -rc.getChildAt(i - 1).x - rc.getChildAt(i - 1).width - g;
                    else rc.getChildAt(i).x = -rc.getChildAt(i).width;
                }
                break;
            }
        }

        p.addTool = function(tool) {
            var i;
            switch (tool.align) {

            case Tool.ALIGN_LEFT:
                i = lc.numChildren;
                lc.addChild(tool);
                if (i != 0) tool.x = lc.getChildAt(i - 1).x + lc.getChildAt(i - 1).width + g;
                else tool.x = g;
                break;
            case Tool.ALIGN_RIGHT:
                i = rc.numChildren;
                rc.addChild(tool);
                if (i != 0) tool.x = -rc.getChildAt(i - 1).x - tool.width - g;
                else tool.x = -tool.width;
                break;
            }
        }

        p.getWidth = function() {
            return w
        }

        p.getHeight = function() {
            return h
        }

    }
}
 /***************************************************** 
  * File path: src/vfold/layer/widgets.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

    function Widget(){
   		inherit(Widget,new Container());
    }
 /***************************************************** 
  * File path: src/vfold/core.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/


function Core() {

}
 /***************************************************** 
  * File path: src/vfold/vfold.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function VFold() {

    
    var p = Class.prototype,c=p.constructor;

    function Class() {

        this.color = 0x232323;
    }

    c.PANEL_HEIGHT=50;

    /****************************************************************
     * Core Components
     ****************************************************************/

    c.desktops;
    c.panels;
    c.folders;
    c.widgets;

    /****************************************************************
     * Event Constants
     ****************************************************************/

    c.WORKSPACE_CHANGE = "workspaceChange";
    c.WORKSPACE_ADD = "workspaceAdd";

    /****************************************************************
     * Rest of properties
     ****************************************************************/

    var intWorkspaceIndex;

    const dctLibraries = {};
    const vctWorkspaces = [];
    var eventDispatcher_;

    /*********************************
     * Core Options
     *********************************/
    var AES_KEY;
    var FACEBOOK_APP_ID;
    /*********************************
     * Secure Value Object for User
     *********************************/
    c.USER;
    /*********************************
     * Gateway Session and if is Root
     *********************************/
    c.HEADER;
    /**********************************
     * Gateway KEY for acceptable calls
     **********************************/
    var ROOT_ENCRYPTED;
    /*********************************
     * Net Connection Pool
     *********************************/
    var NET_POOL;

    function Core() {

        eventDispatcher_ = new EventDispatcher();
        NET_POOL = new Pooling(NetConn);
    }

    c.init = function(options, onReady) {


        /***********************************************
         * Set Core Configuration Options
         ***********************************************/

        AES_KEY = options.aesKey;
        FACEBOOK_APP_ID = options.facebookAppID;
        ROOT_ENCRYPTED = encrypt(options.rootPassword, 128);

        HEADER = new VOHeader();
        HEADER.session = new VOSession();

        /*********************************************************************
         * INIT your session via this validation and authentication Function
         *********************************************************************/

        rootCall("Session.init", function(session) {
            var
            sov = session,
                sobSES = SharedObject.getLocal("vfold_session", "/");

            HEADER.session.id = sobSES.data.id = sov.id;
            HEADER.session.code = sobSES.data.code = sov.code;
            sobSES.flush();
            onReady();
        }, [HEADER.session, ROOT_ENCRYPTED]);

        Facebook.init(FACEBOOK_APP_ID, function(success, failure) {
            onFacebookLogin(success, failure);
        });
    }
   
   c.startGUI = function(workspaces) {

        /*********************************************************
         * Init the the Secure Class for a session Request and
         * enable AMF calls to the gateway
         *********************************************************/

        panels = new PanelHandler();
        folders = new FolderHandler;
        desktops = new DesktopHandler();
        widgets = new WidgetHandler;

        for (var work in workspaces) {
            var workspace = new Workspace();
            workspace.title = work.title;
            for (var comp in work.components) {
                workspace.setComponent(new WorkspaceComponent(comp));
                if (comp.type == VOComponent.FOLDER) {

                    var path = comp.menu_path.split(".");

                    var parent = workspace.menu;
                    var child;

                    for (var i = 0;
                    i < path.length;
                    i++) {
                        child = parent.children[path[i]];
                        if (!child) {
                            child = new MenuOptions();
                            child.title = path[i];
                        }
                        if (i == path.length - 1) {
                            child.launch = comp.class_path;
                        }
                        parent.children[path[i]] = child;
                        parent = child;
                    }
                }
            }
            vctWorkspaces.push(workspace);
            eventDispatcher_.dispatchEvent(new Event(WORKSPACE_ADD));
        }

        /************************************************
         * Check POST URL Parameters
         ************************************************/

        var pr = VFOLD.stage.loaderInfo.parameters;
        if (pr.confirm) {
            rootCall("User.confirm", function(confirmed) {
                if (confirmed) {
                    notify("Your account has been confirmed!\nNow you can sign-in");
                }
            }, pr.confirm);
        }

        /*********************************************************
         * Call javascript methods
         *********************************************************/

        UtilityJavascript.initMouseWheel(VFOLD.stage);
        UtilityJavascript.changeDocumentTitle(VFOLD.projectTitle + "-" + vctWorkspaces[0].title);

        widgets.init();
        folders.init();
        panels.init();

        panels.addTool(new UserTool());

        stage.addChild(desktops);
        stage.addChild(widgets);
        stage.addChild(folders);
        stage.addChild(panels);

        useWorkspace(0);

        notify("Powered by vfold");
    }
    c.notif = function() {

        var t = " ";
        for (var s in rest) {
            t += String(s) + " ";
        }
        widgets.notifier.notify(t);
    }
    c.useWorkspace = function(index) {

        intWorkspaceIndex = index;
        dispatcher.dispatchEvent(new Event(WORKSPACE_CHANGE));
    }

    c.getDesktopHandler = function() {
        return desktops
    }
    c.getPanelHandler = function() {
        return panels
    }
    c.getFolderHandler = function() {
        return folders
    }
    c.getWidgetHandler = function() {
        return widgets
    }

    c.getDispatcher = function() {
        return eventDispatcher_;
    }
    c.getCurrentWorkspace = function() {
        return vctWorkspaces[intWorkspaceIndex];
    }
    c.getDefaultWorkspace = function() {
        return vctWorkspaces[0];
    }
    c.getCurrentWorkspaceIndex = function() {
        return intWorkspaceIndex;
    }
    c.getCurrentUser = function() {
        return USER;
    }

    c.getLibraries = function() {
        return dctLibraries;
    }

    c.appCall = function(command, onSuccess, params, onError) {

        getConnection(onSuccess, onError).amfCall(command, params, false);
    }
    c.rootCall = function(command, onSuccess, params, onError) {

        getConnection(onSuccess, onError).amfCall(command, params, true);
    }

    function getConnection(onSuccess, onError) {

        var conn = NetConn(NET_POOL.getObject());

        if (NET_POOL.instantiated) {
            conn.onClose = function(conn) {
                NET_POOL.returnToPool(conn)
            }
        }

        conn.onSuccess = onSuccess;
        conn.onError = onError;

        return conn;
    }

    c.getExternalClass = function(srcAppDomain, library, classPath) {

        var tgtAppDomain = dctLibraries[library];
        if (!tgtAppDomain) {
            return null;
        }
        if (!tgtAppDomain.hasDefinition(classPath)) {
            return null;
        }
        return tgtAppDomain.getDefinition(classPath)
    }
    c.checkRootPassword = function(password) {
        return AES_KEY == decrypt(ROOT_ENCRYPTED, password, 128);
    }
    c.signInFacebook = function() {
        Facebook.login(onFacebookLogin, {
            perms: "user_about_me, user_birthday, email, publish_stream, offline_access"
        });
    }
    c.onFacebookLogin = function(success, fail) {
        var m;
/* if(success){
Facebook.api("/me",
function(success:Object,failure:Object):void{
amfCall("Account.getAccountByFID",function(acc:UserPrivate):void{
if(acc){
USR=acc;
Core.dispatcher.dispatchEvent(new Event(Core.USER_CHANGE));
m="Welcome back "+USR.first_name+"!";
}
else{
acc = new UserPrivate();
acc.first_name=success.first_name;
acc.last_name=success.last_name;
acc.facebook_id=success.id;
acc.email=success.email;
acc.gender=success.male;
acc.birthday=success.birthday;
m="Registering Facebook account...";
amfCall("User.add",function():void{

},acc)
}
Core.notify(m);
},success.id)
});
}
else{

} */
    }
    c.signInUser = function(email, password, callback) {

        var strNTF;
        rootCall("User.getOneBy",

        function(response) {
            trace(response.role_value);
            if (response.role_value == UserRole.GUEST) {
                callback(false);
                Core.notify("User has not yet been confirmed..Check your email");
            }
            else {
                rootCall("User.get", function(user) {
                    if (AES_KEY == decrypt(user.password, password)) {
                        USER = user;
                        Core.dispatcher.dispatchEvent(new Event(VFOLD.USER_CHANGE));
                        callback(true);
                        strNTF = "Welcome back " + USER.first_name + "!";
                    }
                    else {
                        callback(false);
                        strNTF = "Wrong password, try again";
                    }
                    Core.notify(strNTF);
                }, response.id);
            }
        }, [{
            email: email
        }, ["role_value", "id"]],

        function(errorCode) {
            if (errorCode == ErrorUser.NOT_FOUND) Core.notify("Wrong email,try again");
        });
    }
    /************************************************
     * AES Encryption
     ************************************************/
    c.encrypt = function(password, bitKey) {
        return UtilityCryptography.encrypt(AES_KEY, password, bitKey ? bitKey : 256);
    }
    /************************************************
     * AES Decryption
     ************************************************/
    c.decrypt = function(encrypted, password, bitKey) {
        return UtilityCryptography.decrypt(encrypted, password, bitKey ? bitKey : 256);
    }
}
 /***************************************************** 
  * File path: src/vfold/options.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Options(rootPassword, aesKey, facebookAppID) {

    /********************************************************************
     *  Security options for the vfold platform
     ********************************************************************/

        this.rootPassword = rootPassword;
        this.aesKey = aesKey;
        this.facebookAppID = facebookAppID;
    }
 /***************************************************** 
  * File path: src/vfold/component/folder.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/
 
        function Folder(){

        }
        Folder.prototype={

        };

 /***************************************************** 
  * File path: src/vfold/component/wallpaper.js 
  *****************************************************/ 

 /***************************************************** 
  * File path: src/vfold/component/tool.js 
  *****************************************************/ 

 /***************************************************** 
  * File path: src/vfold/component/widget.js 
  *****************************************************/ 

 /***************************************************** 
  * File path: src/vfold/page.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

var page = {};

page.init = function() {

	stage.init();
	window.onresize();
	var shape = new Shape();
	shape.beginFill(1, .2, 0, 1);
	shape.x = 126;
	shape.drawRect(0, 0, 300, 100);
	//shape.endFill();
	//Stage.add(shape);
}

 /***************************************************** 
  * File path: src/vfold/utility/webgl.js 
  *****************************************************/ 
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
 /***************************************************** 
  * File path: src/vfold/utility/math.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

    // Returns a random integer from 0 to range - 1.
    Math.randomInt = function(range) {
        return Math.floor(Math.random() * range);
    };
 /***************************************************** 
  * File path: src/vfold/utility/pooling.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Pooling() {
   
   /*****************************************
     *  Objects in the Pool (Active/Inactive)
     *****************************************/
    var availableOBJs = [],
        activeOBJs = [],
        /*********************************
         *  Object Class
         *********************************/
        OC,
        /*****************************************
         *  If last Object got was instantiated
         *****************************************/
        ib;

    function Class(ObjectClass) {

        OC = ObjectClass;
    }

    Class.prototype = {

        getObject: function() {
            var o;
            if (availableOBJs.length > 0) {
                o = availableOBJs.pop();
                ib = false;
            }
            else {
                o = new OC();
                ib = true;
            }
            activeOBJs.push(o);
            return o;
        },

        returnToPool: function(object) {
            activeOBJs.splice(activeOBJs.indexOf(object), 1);
            availableOBJs.push(object);
        },

        returnAll: function() {
            while (activeOBJs.length > 0) {
                var o = activeOBJs[0];
                activeOBJs.splice(0, 1);
                availableOBJs.push(o);
            }
        },

        getObjects: function() {
            return activeOBJs;
        },

        isLastInstantiated: function() {
            return ib;
        },

        numActiveObjects: function() {
            return activeOBJs.length;
        }

    };
    Pooling=Class;
}
 /***************************************************** 
  * File path: src/vfold/control/menu.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

    /********************************************
     * Drop down list of menu Buttons that can 
     * have manu additional attributes
     ********************************************/

    function Menu() {
        // Menu Parent
        var p = new MenuButtons(VFold.color, intGAP);

        // Target Event ParentContainer
        var intGAP = 7;
        var fncDWN;

        function Class() {

            var
            /*********************************
             * Parent Menu Button
             *********************************/
            mbt,
            /*********************************
             * Child Menu Buttons
             *********************************/
            mbs;
            
            addEventListener(MouseEvent.MOUSE_OVER, function(e) {
                if (MenuButton) {

                    if (mbs) if (mbs != e.target.parent.parent) mbs.fadeOut();

                    mbt = e.target;
                    mbs = e.target.parent.buttonContainer;

                    mbt.onMouseOver();
                    mbs.fadeIn();
                    mbs.previousIndex = mbt.index;
                }
            });

            addEventListener(MouseEvent.MOUSE_OUT, function(e) {
                if (e.target) {

                    mbt = e.target;
                    mbt.onMouseOut();
                }
            });

            addEventListener(MouseEvent.MOUSE_DOWN, function(e) {
                if (MenuButton) {

                    mbt = e.target;
                    mbt.onMouseDown();
                    if (fncDWN) fncDWN(mbt);
                }
            });
        }

        p.getGap = function() {
            return intGAP;
        }

        p.setMenuButtonCallback = function(callback) {
            fncDWN = callback;
        }

        Menu = Class;
    }

    /********************************************
     * Drop down list of menu Buttons that can 
     * have manu additional attributes
     ********************************************/

    function MenuButtons() {

        var p = new Container();

        function Class(buttonColor, buttonGap) {

            bC = buttonColor;
            bG = buttonGap;

           // ttl = new TimelineLite({
        //        paused: true
          //  });
        }

        // Button Vector
        var bV = [],
            // Button Color
            bC,
            // Button Gap
            bG,
            // Tween Time-line Lite
            ttl,
            // Tween-Max Array
            tma = [],
            // Tween-Objects Array
            toa = [],
            // Tween Duration
            tdr = .35,

            // Previous Index
            pI;

        p.addButtons = function(dataButtons) {

            var i = 0;
            var j = bV.length;
            var mxW = 0;

            for (var button in dataButtons) {
                bV[i] = new MenuParent(
                bC, bG, button);
                bV[i].button.index = i;
                bV[i].button.alpha = 0;
                if (i != 0) {

                    bV[i].y += i * (bV[i - 1].height + bG);
                }
                if (i != j) {

                    mxW = Math.max(mxW, bV[i].button.width);
                }
                else {

                    mxW = bV[i].button.width;
                }
                toa.push(bV[i].button);
                addChild(bV[i]);
                i++;
            }

            i = j;
            if (j > 1) if (mxW > bV[j - 1].button.width) i = 0;

            for (i; i < bV.length; i++) {

                bV[i].width = mxW;
            }
            ttl.clear();
            tma = TweenMax.allFromTo(toa, tdr, {
                alpha: 0,
                y: "50"
            }, {
                alpha: 1,
                y: "-50"
            }, tdr / toa.length);
            ttl.insertMultiple(tma);
        }
        p.fadeIn = function() {

            ttl.play();
            mouseChildren = true;
        }
        p.fadeOut = function() {

            ttl.reverse();
            mouseChildren = false;

            if (bV.length > 0) {

                bV[pI].buttonContainer.fadeOut();
            }
        }
        p.setPreviousIndex = function(value) {
            pI = value
        }

        function MenuParent() {

            var p = MenuParent.prototype;

            // Button Container
            var bC;
            // Button Label
            var bL;
            // Button Gap
            var bG;

            function Class(buttonColor, buttonGap, buttonData) {
                bG = buttonGap;
                bC = new MenuButtons(buttonColor, bG);
                bL = new MenuButton(buttonColor, buttonData, buttonData.children.length > 0);

                addChild(bC);
                addChild(bL);

                if (buttonData) bC.addButtons(buttonData.children);
            }
            p.getButtonContainer = function() {
                return bC;
            }
            p.getButton = function() {
                return bL;
            }

            p.setWidth = function(value) {

                bL.width = value;
                bC.x = value + bG;
            }
            p.getHeight = function() {

                return bL.height;
            }
        }
    }

    /********************************************
     * The Child Button of a group belonging in   
     * menu tree hierarchy
     ********************************************/

    function MenuButton() {

        var p = new Container();


    }
 /***************************************************** 
  * File path: main.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0 *
 * *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the *
 * following licensing notice adjacent to the copyright notice for *
 * the Original Work *
 *********************************************************************/

/********************************************
 * Global Constants
 ********************************************/
const VFoldEvent = {
    WORKSPACE_CHANGE: "workspaceChange",
    WORKSPACE_ADD: "workspaceAdd",
    FOLDER_CREATE: "FolderAdd",
    FOLDER_CLOSING: "FolderClose",
    FOLDER_SELECT: "FolderSelect"
};

this.addEventListener("DOMContentLoaded",
function (e)
{
    var opt = new Options();
    opt.aesKey = "796x9qh27xcrb69q27xcrb61274xcr6b";
    opt.facebookAppID = "";
    opt.rootPassword = "w957cbnooo5796";
    page.init();
}
,true);

/*********************************************
 * Wrapped logging function.
 * @param {string} msg The message to log.
 *********************************************/
 
var log = function(msg) {
        if (window.console && window.console.log) {
            window.console.log(msg);
        }
    };
/**********************************************
 * Wrapped logging function.
 * @param {string} msg The message to log.
 **********************************************/
var error = function(msg) {
        if (window.console) {
            if (window.console.error) {
                window.console.error(msg);
            }
            else if (window.console.log) {
                window.console.log(msg);
            }
        }
    };

function inherit(ParentInstance) {
    var p = arguments.callee.prototype;
    p = ParentInstance;
    p.constructor = Child;
    return p;
}
 /***************************************************** 
  * WebGL Shaders 
  *****************************************************/ 

 var shader={"fragment":{},"vertex":{}};
 /***************************************************** 
  * File path: src/vfold/display/shader/fragment.color.shader 
  *****************************************************/ 

 shader.fragment.color= 'precision mediump float;uniform vec4 color;void main() {    gl_FragColor = color;}';
 /***************************************************** 
  * File path: src/vfold/display/shader/fragment.bezier.shader 
  *****************************************************/ 

 shader.fragment.bezier= '#extension GL_OES_standard_derivatives : enable\n#ifdef GL_ES\nprecision highp float;\n#endif \nuniform vec2 bezierCoord;uniform vec4 color;void main(void) {vec2 px = dFdx(bezierCoord);vec2 py = dFdy(bezierCoord);float fx = 2.0 * bezierCoord.x * px.x - px.y;float fy = 2.0 * bezierCoord.y * py.x - py.y;float sd = (bezierCoord.x * bezierCoord.x - bezierCoord.y) / sqrt(fx * fx + fy * fy);gl_FragColor = color * vec4(1,1,1, clamp(0.5 - sd, 0.0, 1.0));}';
 /***************************************************** 
  * File path: src/vfold/display/shader/vertex.matrix.shader 
  *****************************************************/ 

 shader.vertex.matrix= 'attribute vec2 position;uniform mat3 transformation;uniform vec2 projection;void main() {	float angleInRadians = radians(transformation[2][0]);	float c = cos(angleInRadians);	float s = sin(angleInRadians);	mat3 rotation = mat3(c, -s, 0, s, c, 0, 0, 0, 1);	mat3 scale = mat3(transformation[1][0], 0, 0, 0,transformation[1][1], 0, 0, 0, 1);	mat3 translation = mat3(1, 0, 0, 0, 1, 0, transformation[0][0], transformation[0][1], 1);	mat3 projection = mat3(projection.x*0.5, 0, 0, 0,projection.y*0.5, 0, -1, 1, 1);	gl_Position = vec4((scale * rotation * translation * projection * vec3(position, 1)).xy, 0, 1);}';