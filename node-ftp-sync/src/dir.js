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
