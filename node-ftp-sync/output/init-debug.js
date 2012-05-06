
 /***************************************************** 
  * File path: constructor.js 
  *****************************************************/ 
undefined
 /***************************************************** 
  * File path: node-ftp-sync/src/common.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function readableFileSize(size) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while (size >= 1024) {
        size /= 1024;
        ++i;
    }
    return size.toFixed(1) + ' ' + units[i];
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
    } else {
      callback();
    }
  };
}


 /***************************************************** 
  * File path: node-ftp-sync/src/dir.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/****************************
 * Directory Object
 ****************************/

function Dir(path) {

    this.path = path;
    this.files = [];
    this.dirs = [];
}
Dir.prototype = {

    addFile: function(value) {
        this.files.push(value);
    },
    addDir: function(value) {
        this.dirs.push(value);
    },
    setPath: function(value) {
        this.path = value;
    }
};

/***********************************************
 * Asyncronous Complete Directory Tree Listing.
 * List root directory and instantiate through
 * asynchronous loops while stepping into the
 * tree.
 ***********************************************/

function DirTree(path, callback) {

    resetListStats();

    /***********************************************
     * Will trigger each step into the tree
     * when a directory listing is complete
     * and create an instance within an instance
     * of this object
     **********************************************/

    function Read(dirs, callback) {

        var asyncLoop = new AsyncLoop(dirs, function() {
            callback();
        });

        asyncLoop.start(

        function(dir) {
            listDir(dir, function(dir) {
                new Read(dir.dirs, function() {
                    asyncLoop.next();
                });
            });
        });
    }
    /****************************
     * Start the looping
     ****************************/
    DirTree.prototype = new Dir(path);
    listDir(DirTree.prototype, function(dir) {
        new Read(dir.dirs, function() {
            console.log("Read " + totalFiles + " files of total size: " + readableFileSize(totalFileSize));
            callback(dir);
        });
    });
}

/*********************************************************
 * Check if the FTP client can place a call to the Server
 *********************************************************/

var done = true;

function canCall() {

    if (!done) {
        console.log("Cannot call.. FTP connection is in use");
        return false;
    }
    done = false;
    return true;
}

/********************************************************
 * Listing Stats set to default values
 ********************************************************/

function resetListStats() {

    totalFileSize = 0;
    totalFiles = 0;
}

/********************************************************
 * List the entries in the given diectory 
 ********************************************************/

function listDir(dir, callback) {
    if (!canCall) {
        return;
    }
    conn.cwd(dir.path, function(e) {
        if (e) throw e;
        conn.list(function(e, response) {
            if (e) throw e;
            var count = 0;
            response.on('entry', function(entry) {
                if (entry.type === 'l') entry.type = 'LINK';
                else if (entry.type === TYPE_FILE) {
                    dir.addFile(entry);
                    totalFileSize += parseInt(entry.size,10);
                    totalFiles++;
                }
                else if (entry.type === TYPE_DIR) {
                    if (entry.name == "." || entry.name == "..") {
                        return;
                    }
                    dir.addDir(new Dir(dir.path + "/" + entry.name));
                }
                //console.log(' ' + entry.type + ' ' + entry.size + ' ' + formatDate(entry.date) + ' ' + entry.name);
            });
            response.on('raw', function(s) {
                //console.log('<raw entry>: ' + s);
            });

            response.on('error', function(e) {
                console.log('ERROR during list(): ' + util.inspect(e));
                conn.end();
            });
            response.on('end', onDone);
            response.on('success', onDone);

            function onDone() {
                count++;
                if (count == 2) {
                    //console.log('Found in <' + dir.path + '> : \n' + dir.files.length + " files \n " + dir.dirs.length + " directories \n -------------");
                    callback(dir);
                    done = true;
                }
            }
        });
    });
}

function formatDate(d) {
    return (d.year < 10 ? '0' : '') + d.year + '-' + (d.month < 10 ? '0' : '') + d.month + '-' + (d.date < 10 ? '0' : '') + d.date;
}

 /***************************************************** 
  * File path: node-ftp-sync/src/download.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/**********************************************************************
 * Download Entire Directory Contents
 **********************************************************************/

function downloadDir(overwrite) {

    if (overwrite) {
        console.log("<Pulling data from server and overwriting>");

    }
    new DirTree(dirRemoteTarget, function(dir) {

        /****************************************************
         * Check the file if exists on local directory othewise
         * download from FTP server. Overwrite file if option
         * is enabled
         ****************************************************/

        createStructure(dir, function() {
            console.log("<Done!>");
            conn.end();
        });
    });
    /****************************************************
     * Check Local Path mapping with remote FTP server
     ****************************************************/

    function checkLocalPath(path, callback) {
        currLocalPath = path.substr(path.indexOf(dirRemoteTarget) + dirRemoteTarget.length + 1);
        try {
            fs.lstatSync(currLocalPath);
            callback();
        } catch (e) {
            fs.mkdir(currLocalPath, 755, callback);
        }
    }


    function createStructure(dir, action, callback) {

        new CreateDirectories([dir], callback);

        /****************************************************
         * Read directories async and create local dirs if missing
         ****************************************************/

        function CreateDirectories(dirs, callback) {

            var asyncLoop = new AsyncLoop(dirs, function() {
                callback();
            });

            asyncLoop.start(

            function(dir) {
                checkLocalPath(dir.path, function() {

                    createFiles(dir.files, function() {
                        new CreateDirectories(dir.dirs,asyncLoop.next);
                        });
                    });
                });
        }

        /****************************************************
         * Go through each file and fire the action callback
         ****************************************************/

        function createFiles(files, callback) {
            var asyncLoop = new AsyncLoop(files, function() {
                callback();
            });

            asyncLoop.start(function(file) {

                // TODO: This seems to be wrong. Have to fix this
                var filePath = currLocalPath.length > 1 ? (currLocalPath + "/") : "";
                filePath += file.name;
                try {
                    fs.lstatSync(filePath);
                    callback();
                } catch (e) {

                    downloadFile(filePath,dirRemoteTarget + "/" + filePath,syncLoop.next);
                }
            });
        }
    }
}

/**********************************************************************
 * Downlaod File
 **********************************************************************/

function downloadFile(localPath,remotePath,callback) {
                    conn.get(remotePath,function(e, stream) {
                        if (e) throw e;
                        stream.on('success', function() {
                            console.log("wrote " + file.name);
                            callback();
                        });
                        stream.on('error', function(e) {
                            console.log('ERROR during get(): ' + util.inspect(e));
                            callback();
                        });
                        stream.pipe(fs.createWriteStream(localPath));
                    });
}
 /***************************************************** 
  * File path: node-ftp-sync/src/upload.js 
  *****************************************************/ 
/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

/**********************************************************************
 * Upload Directory
 **********************************************************************/

function uploadDir(localPath) {}

/**********************************************************************
 * Upload File
 **********************************************************************/

function uploadFile(fileName) {

    conn.put(fs.createReadStream(fileName), fileName, function(e, stream) {
        if (e) throw e;
        stream.on('success', function() {
            console.log("Uploaded: " + fileName);
        });
    });
}
 /***************************************************** 
  * File path: node-ftp-sync/src/arguments.js 
  *****************************************************/ 
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
 /***************************************************** 
  * File path: init.js 
  *****************************************************/ 
undefined