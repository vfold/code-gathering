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