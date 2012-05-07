 var global = {};

 window.onload = function() {

   stage.init();

   new Core();

   window.onresize();
 }

 /*********************************************
  * Wrapped logging function.
  * @param {string} msg The message to log.
  *********************************************/

 function log(msg) {
   if (window.console && window.console.log) {
     window.console.log(msg);
   }
 };

 /**********************************************
  * Wrapped logging function.
  * @param {string} msg The message to log.
  **********************************************/

 function error(msg) {
   if (window.console) {
     if (window.console.error) {
       window.console.error(msg);
     } else if (window.console.log) {
       window.console.log(msg);
     }
   }
 };

 /**********************************************
  * Add or change values to object
  **********************************************/

 function put(object, values) {
   for (var key in values) {
     object[key] = values[key];
   }
 }


