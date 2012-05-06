/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

module.exports = {

  init: function(args) {

/*******************************************************
 * FTP Client for file synchronisation
 ********************************************************/

var FTPClient = require('ftp'),
    util = require('util'),
    fs = require("fs"),
    conn,
    actions={
        do:function(){
            downloadDir(true);
            },
            dk:function(){
            downloadDir(false);
            },
            uo:function(){
            uploadDir(true);
            },
            uk:function(){
            downloadDir(false);
            }
    },
        action = actions.dk,
    host = args[3],
    port = args[4],
    user,
    pass,
    dirLocalTarget = "./",
    dirRemoteTarget = "./",
    options={
         /*----------------------------------------
                 * Action Option
                 * do: download && overwrite
                 * dk: download && keep
                 * uo: upload && overwrite
                 * uk: upload && keep
                 *----------------------------------------*/
        a: function(value){
            if(actions.hasOwnProperty(value)){
                action=actions[value]
                }
                else{
                    throw "Could not recognise the action specified.\nAvailable actions:\ndo: download && overwrite\ndk: download && keep\nuo: upload && overwrite\nuk: upload && keep";
                }
        
        },
         /*----------------------------------------
                 * FTP Server Host domain
                 *----------------------------------------*/
        h: function(value){
            host=value;
        },
         /*----------------------------------------
                 * Port
                 *----------------------------------------*/
        p: function(value){
            port=value;
        },
        /*----------------------------------------
                 * Username
                 *----------------------------------------*/
        U: function(value){
            user=value;
        },
        /*----------------------------------------
                 * Password
                 *----------------------------------------*/
        P: function(value){
            pass=value;
        },
        /*----------------------------------------
                 * Local Path target
                 *----------------------------------------*/
        l: function(value){
            dirLocalTarget=value;
        },
        /*----------------------------------------
                 * Remote Path target
                 *----------------------------------------*/
        r: function(value){
            dirRemoteTarget=value;
        }
        }

    /********************************************
     * Loop through arguments and check options
     ********************************************/
     var i;
     for (i=0;i<args.length;i++)
{
    var arg=arg[i];
    if(arg.indexOf("-")==0){
        var option=arg.substr(1);
        if(options.hasOwnProperty(option)){
            options[option](args[i++]);
        }
    }
    
    
}


var

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
 
 }