var pathUglify = "uglify-js",
    /*****************************
     * File System
     *****************************/
    fs = require("fs"),
    jsp = require(pathUglify).parser,
    pro = require(pathUglify).uglify,
    path, files, stats, countFile = 0,
    countShaderFiles = 0,
    outputDir, classMainName, classInit, classPreInit, debug, pathSource, pathOutput,
    /********************************************
     * javascript Code
     * Original Merged -> Abstract Syntax Tree
     ********************************************/
    code = "",
    codeShader = commentBlock("WebGL Shaders") + '\n var shader={"fragment":{},"vertex":{}};';

module.exports = {

    init: function(args) {
        
        /********************************************
         * Loop through arguments and check options
         ********************************************/

        function checkArguments(args, options) {
            var i;
            for (i = 0; i < args.length; i++) {
                var arg = args[i];
                if (arg.indexOf("-") == 0) {
                    var option = arg.substr(1);
                    if (options.hasOwnProperty(option)) {
                        if (args[i++].indexOf("-") == -1) {
                            options[option](args[i++]);
                        }
                    }
                }
            }
        }
        checkArguments(args,{
            // Add Init class at end
            i: [function(value) {
                classInit = value;
            }, "init.js"],
            // Add constructor class at beginning
            c: [function(value) {
                classPreInit = value;
            }, "constructor.js"],
            // Debug mode (True/False)
            d: [function(value) {
                debug = value;
            },false],
            // Read all files from source folder specified in given arguments
            s: [function(value) {
                pathSource = value;
                try {
                    stats = fs.lstatSync(pathSource);
                    if (!stats.isDirectory()) {
                        throw "Source path is not a directory";
                    }
                }
                catch (e) {
                    throw "Could not find source folder: \"" + pathSource + "\"\nCurrent working directory: \"" + process.cwd() + "\"";
                }
            }, "src"],
            // Output path for compiled data
            o: [function(value) {
                pathOutput = value;
            }, "output"]
        });
        /****************************************
         * Loop through the source folder and
         * obtain the js files for compilation
         ****************************************/
        addFile(path = checkFile(classPreInit) + ".js", function() {

            new readDir(pathSource, function() {

                classMainName = checkFile(classInit);

                addFile(path = classMainName + ".js", function() {


                    if (countShaderFiles > 0) code += codeShader;

                    if (!debug) {

                        /********************************************
                         * 1. Parse code and get the initial AST
                         * 2. Get a new AST with mangled names
                         * 3. Get an AST with compression optimizations
                         ********************************************/

                        code = pro.gen_code(
                        pro.ast_squeeze(
                        pro.ast_mangle(
                        jsp.parse(code))));
                    }

                    /********************************************
                     * Output path for compiled build
                     ********************************************/

                    if (pathOutput.indexOf(".js") == -1) {
                        outputDir = pathOutput;
                        pathOutput += "/" + classMainName + (debug ? "-debug" : "") + ".js";

                    }
                    else {
                        outputDir = getUntilLast(pathOutput, "/");
                    }
                    console.log("Main:   " + classInit + "\nOutput: " + pathOutput);
                    try {
                        fs.lstatSync(outputDir);
                    }
                    catch (e) {
                        fs.mkdirSync(outputDir);
                    }
                    fs.writeFileSync(pathOutput, code);
                    console.log("----------------------------------- \n" + "Compiled Files: " + countFile + "\nShader Files: " + countShaderFiles + "\nOutput size: " + parseInt(fs.lstatSync(pathOutput).size / 1024, 10) + "KB \n" + "-----------------------------------");
                });
            });
        });
    }
};

function checkFile(filename) {

    /********************************************
     * Append .js file to the output code
     ********************************************/

    var name, i = filename.lastIndexOf(".");
    if (i != -1) {
        if (filename.substr(i) != ".js") {
            throw 'Wrong extension for main file: "' + filename + '"';
        }
        return getUntilLast(filename, ".");
    }
    else {
        return filename;
    }

    try {
        fs.lstatSync(filename);
    }
    catch (e) {
        throw 'Invalid Main JS File: "' + filename + '"';
    }

    return name;

}

function readDir(dir, callback) {

    var asyncLoop = new AsyncLoop(fs.readdirSync(dir), callback);

    asyncLoop.start(

    function(entryName) {
        path = dir + "/" + entryName;
        stats = fs.lstatSync(path);
        if (stats.isDirectory()) {
            new readDir(path, asyncLoop.next);
        }
        else if (stats.isFile()) {
            addFile(entryName, asyncLoop.next);
        }
    });

}

/**************************************************
 * Add File to the output code string
 **************************************************/

function addFile(filename, callback) {

    var comment = "";
    if (debug) {
        comment = commentBlock("File path: " + path);
    }
    if (filename.indexOf(".js") != -1) {
        countFile++;
        fs.readFile(path, function(e, data) {
            code += comment + data;
            callback();
        });
    }
    else if (filename.indexOf(".shader") != -1) {
        codeShader += comment;
        countShaderFiles++;
        minifyShader(path, function(data) {
            codeShader += "\n shader." + getUntilLast(filename, ".") + "= '" + data + "';";
            callback();
        });

    }
    else {
        callback();
    }
}

/**************************************************
 * Comment out anything necessary when compiling
 **************************************************/

function commentBlock(comment) {

    return "\n /***************************************************** \n  * " + comment + " \n  *****************************************************/ \n";
}

/**************************************************
 * Get part of string
 **************************************************/

function getUntilLast(string, character) {
    return string.substr(0, string.lastIndexOf(character));
}

/**************************************************
 * Remove comments and bring code to one line
 **************************************************/


function minifyShader(path, callbackShader) {

    var fs = require('fs'),
        code = "",
        callbackLine = checkLine,
        line;

    readLines(fs.createReadStream(path));

    function readLines(input) {

        var remaining = '';

        input.on('data', function(data) {
            remaining += data;
            var index = remaining.indexOf('\n');
            while (index > -1) {
                line = remaining.substring(0, index);
                remaining = remaining.substring(index + 1);
                callbackLine(line);
                index = remaining.indexOf('\n');
            }
        });

        input.on('end', function() {
            if (remaining.length > 0) {
                line = remaining;
                callbackLine();
                callbackShader(code);
            }
        });
    }

    function checkLine() {

        if (has("/*")) {
            startDo("*/");
            return;
        }
        else if (has("//")) {
            return;
        }
        else if (has("#")) {
            add();
            if (has("ifdef")) {
                startDo("#endif", add);
            }
            return;
        }
        code += line;
    }

    function add() {
        code += line + "\\n";
    }

    function startDo(terminator, action) {
        callbackLine = function(line) {
            if (action) action();
            if (has(terminator)) {
                callbackLine = checkLine;
                return;
            }
        };
    }

    function has(character) {
        return (line.indexOf(character) != -1);
    }
}

/***********************************
 * Asyncronous Looping for an array
 ***********************************/

function AsyncLoop(loopArray, callbackFunction) {

    var
    array = loopArray,
        callback = callbackFunction,
        action, count = 0;

    this.start = function(actionFunction) {
        count = -1;
        action = actionFunction;
        this.next();
    };
    this.next = function() {
        count++;
        if (count < array.length) {
            action(array[count]);
        }
        else {
            callback();
        }
    };
}