/*********************************************************************
 * Licensed under the Open Software License version 3.0              *
 *                                                                   *
 * This Open Software License (OSL-3.0) applies to any original work *
 * of authorship "vfold" whose owner Raphael Varonos has placed the  *
 * following licensing notice adjacent to the copyright notice for   *
 * the Original Work                                                 *
 *********************************************************************/

function Child() {

    var 
    p = Child.prototype,
    /* transformation Matrix*/
    transformation = [0, 0, 0, 1, 1, 0, 0, 0, 0];
    
    this.id;
    this.parentId;

    function render(){
        gl.setUniform("transformation",transformation);
        gl.setUniform("projection",[stage.width,stage.height]);
    }
    /******************************************************************
     * Tranformation Setters and Getters
     ******************************************************************/

    this.setRotation = function(value) {
        transformation[6] = value;
    }
    this.setScaleX = function(value) {
        transformation[3] = value;
    }
    this.setScaleY = function(value) {
        transformation[4] = value;
    }
    this.setX = function(value) {
        transformation[0] = value;
    }
    this.setY = function(value) {
        transformation[1] = value;
    }
    this.getX = function() {
        return transformation[0];
    }
    this.getY = function() {
        return transformation[1];
    }
    this.getScaleX = function() {
        return transformation[3];
    }
    this.getScaleY = function() {
        return transformation[4];
    }
    this.getRotation = function() {
        return transformation[6];
    }
    this.getOrder = function(){
        return p.getChildOrder(p);
    }
}
