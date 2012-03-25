/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/


/*******************************************************
 * FTP Client for file synchronisation
 ********************************************************/

var FTPClient = require('ftp'),
    util = require('util'),
    fs = require("fs"),
    conn,

    /********************************************
     * Command Arguments starting from index 2
     ********************************************/

    action = process.ARGV[2],
    host = process.ARGV[3],
    port = process.ARGV[4],
    user = process.ARGV[5],
    pass = process.ARGV[6],
    dirLocalTarget = process.ARGV[7],
    dirRemoteTarget = process.ARGV[8],

    /********************************************
     * Current Working Path on Local file system
     ********************************************/

    currLocalPath = dirLocalTarget,

    /********************************************
     * Types of entries received by a directory 
     * listing from the FTP server
     ********************************************/

    TYPE_FILE = "-",
    TYPE_DIR = "d",

    totalFileSize, totalFiles;


conn = new FTPClient();
conn.connect(port, host);

conn.on('connect', function() {
    conn.auth(user, pass, function(e) {
        if (e) throw e;
        switch (action) {
        case "download-overwrite":
            downloadDir(true);
            break;
        case "download-keep":
            downloadDir(false);
            break;
        case "upload-overwrite":
            uploadDir(true);
            break;
        case "upload-keep":
            uploadDir(false);
            break;
        }
    });
});