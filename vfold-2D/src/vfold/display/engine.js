///////////////////////////////////////////////////////////////////////
//  engine Object
///////////////////////////////////////////////////////////////////////
/*********************************************************************
 * Kinetic engine Object
 * @property {Object} engineObjet
 *********************************************************************/
var engine = {
    idCounter: 0,
    tempNodes: [],
    animations: [],
    animIdCounter: 0,
    dragTimeInterval: 0,
    maxDragTimeInterval: 20,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        },
        lastDrawTime: 0
    },
    addAnimation: function(anim) {
        anim.id = engine.animIdCounter++;
        this.animations.push(anim);
    },
    removeAnimation: function(id) {
        var animations = this.animations;
        for (var n = 0; n < animations.length; n++) {
            if (animations[n].id === id) {
                this.animations.splice(n, 1);
                return false;
            }
        }
    },
    _pullNodes: function(stage) {
        var go = engine;
        var tempNodes = go.tempNodes;
        for (var n = 0; n < tempNodes.length; n++) {
            var node = tempNodes[n];
            stage._addId(node);
            stage._addName(node);
            go.tempNodes.splice(n, 1);
            n -= 1;
        }
    },
    _runFrames: function() {
        var nodes = {};
        for (var n = 0; n < this.animations.length; n++) {
            var anim = this.animations[n];
            if (anim.node && anim.node._id !== undefined) {
                nodes[anim.node._id] = anim.node;
            }
            anim.func(this.frame);
        }

        for (var key in nodes) {
            nodes[key].draw();
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if (this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        } else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
        if (this.animations.length > 0) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function() {
                that._animationLoop();
            });
        } else {
            this.frame.lastTime = 0;
        }
    },
    _handleAnimation: function() {
        var that = this;
        if (this.animations.length > 0) {
            that._animationLoop();
        } else {
            this.frame.lastTime = 0;
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
