/**********************************************
 * Class definition
 * Make these private and finish fixing it
 **********************************************/

(function() {

  var queue = {},
    pending = {};

  window.define = function(name, definition, parents) {

    var queueName, pName, index;

    self = {};
    if (window.hasOwnProperty(name)) {
      return;
    }
    window[name] = definition(self);

    /**********************************************
     * Extending Classes
     **********************************************/

    for (index in parents) {
      pName = parents[index];
      // Checking if the parent Class has been defined
      if (!window.hasOwnProperty(pName)) {
        // Add to the parent pending list which classes have to be extended
        if (!pending.hasOwnProperty(pName)) {
          pending[pName] = new Array();
        }
        pending[pName].push(name);
        continue;
      }
      put(self, window[pName].prototype);
    }
    window[name].prototype = self;

    /********************************************************
     * Load extending prototype to classes put in the queue
     ********************************************************/

    if (pending.hasOwnProperty(name)) {

      for (index in pending[name]) {

        put(window[pending[name][index]].prototype, self);
      }
      delete pending[name]
    }
  }
})();
// call super constructor

function parent(constructor, parameters) {
  constructor.apply(arguments.callee.prototype, parameters);
}
