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

