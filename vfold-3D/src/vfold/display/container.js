/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Container() {

    /************************************************
     * Index = Child Order
     * Value = Child Id
     *************************************************/
    var childrenIds = [],
        /************************************************
         * Index = Child Id
         * Value = Child Order
         *************************************************/
        childrenOrders = [],

        p = inherit(new Child());
    /************************************************
     * Add Child to the container
     *************************************************/

    this.add = function(child) {

        stage.add(child, p);

        childrenOrders[child.id] = childrenIds.length;
        childrenIds.push(child.id);
    };

    /************************************************
     * Add Child at a specified index
     *************************************************/

    this.addAt = function(child, index) {

        stage.add(child, p);

        childrenOrders[child.id] = index;
        childrenIds.splice(index, 0, child.id);
    };

    /************************************************
     * Remove Display Object Child from the container
     *************************************************/

    this.remove = function(child) {

        stage.remove(child);

        childrenIds.splice(childrenOrders.splice(child.id, 1)[0], 1);
    };

    /************************************************
     * Remove Child from a specific index
     *************************************************/

    this.removeAt = function(index) {

        p.remove(stage.getChild(childrenIds[index]));
    };

    this.getChildOrder = function(child) {
        return childrenOrders[child.id];
    }
    /************************************************
     * Reorder Children based on their array index
     *************************************************/

    function setChildrenIndices() {
        for (var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;
        }
    }
}
