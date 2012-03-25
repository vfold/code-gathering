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