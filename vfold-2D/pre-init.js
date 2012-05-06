 /**********************************************
  * Class definition
  * Make these private and finish fixing it
  **********************************************/

 (function() {

   var queue = {},
     pending = {};

   window.define = function(name, definition, parents) {

     self = {};
     window[name] = definition(self);

     /**********************************************
      * Helper function for extending Classes
      **********************************************/

     for (var index in parents) {

       var pName = parents[index],
         parent = window[pName];

       if (!parent) {

         queue[name] = {
           definition: definition,
           parents: parents
         }
         if (!pending[pName]) {
           pending[pName] = new Array();
         }
         pending[pName].push(name);

         return;
       }
       put(self, parent.prototype);
     }

     window[name].prototype = self;
   }
 })();
