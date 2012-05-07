/*********************************************************************
 * The Tween class was ported from an Adobe Flash Tween library
 * to JavaScript by Xaric.  In the context of KineticJS, a Tween is
 * an animation of a single Node property.  A Transition is a set of
 * multiple tweens
 **********************************************************************/

var Transition, Tween;

/**********************************************************************
 * Transition constructor.  KineticJS transitions contain
 * multiple Tweens
 * @constructor
 * @param {Node} node
 * @param {Object} config
 **********************************************************************/

(function() {

    Transition = function(node, config) {

        this.node = node;
        this.config = config;
        this.tweens = [];

        // add tween for each property
        for (var key in config) {
            if (key !== 'duration' && key !== 'easing' && key !== 'callback') {
                if (config[key].x === undefined && config[key].y === undefined) {
                    this.add(getTween(key, config));
                }
                if (config[key].x !== undefined) {
                    this.add(getComponentTween(key, 'x', config));
                }
                if (config[key].y !== undefined) {
                    this.add(getComponentTween(key, 'y', config));
                }
            }
        }
    };

    self = Transition.prototype;

    /**********************************************************************
     * add tween to tweens array
     * @param {Tween} tween
     **********************************************************************/

    self.add = function(tween) {
        self.tweens.push(tween);
    };

    /**********************************************************************
     * start transition
     **********************************************************************/

    self.start = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].start();
        }
    };

    /**********************************************************************
     * onEnterFrame
     **********************************************************************/

    self.onEnterFrame = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].onEnterFrame();
        }
    };

    /**********************************************************************
     * stop transition
     **********************************************************************/

    self.stop = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].stop();
        }
    };

    /**********************************************************************
     * resume transition
     **********************************************************************/

    self.resume = function() {
        for (var n = 0; n < self.tweens.length; n++) {
            self.tweens[n].resume();
        }
    };

    var getTween = function(key) {
            var config = self.config;
            var node = self.node;
            var easing = config.easing;
            if (easing === undefined) {
                easing = 'linear';
            }

            return new Tween(node, function(i) {
                node.attrs[key] = i;
            }, Tweens[easing], node.attrs[key], config[key], config.duration);
        };

    var getComponentTween = function(key, prop) {
            var config = self.config;
            var node = self.node;
            var easing = config.easing;
            if (easing === undefined) {
                easing = 'linear';
            }

            return new Tween(node, function(i) {
                node.attrs[key][prop] = i;
            }, Tweens[easing], node.attrs[key][prop], config[key][prop], config.duration);
        };
})();

(function() {

    /**********************************************************************
     * Tween constructor
     **********************************************************************/

    Tween = function(obj, propFunc, func, begin, finish, duration) {
        listeners = [];
        this.addListener(this);
        this.obj = obj;
        this.propFunc = propFunc;
        this.begin = begin;
        pos = begin;
        this.setDuration(duration);
        this.isPlaying = false;
        change = 0;
        this.prevTime = 0;
        this.prevPos = 0;
        this.looping = false;
        time = 0;
        position = 0;
        startTime = 0;
        finish = 0;
        this.name = '';
        this.func = func;
        this.setFinish(finish);
    };

    /*********************************************************************
     * Tween public methods
     **********************************************************************/

    self = Tween.prototype;

    self.setTime = function(t) {
        self.prevTime = time;
        if (t > self.getDuration()) {
            if (self.looping) {
                self.rewind(t - duration);
                self.update();
                self.broadcastMessage('onLooped', {
                    target: this,
                    type: 'onLooped'
                });
            } else {
                time = duration;
                self.update();
                self.stop();
                self.broadcastMessage('onFinished', {
                    target: this,
                    type: 'onFinished'
                });
            }
        } else if (t < 0) {
            self.rewind();
            self.update();
        } else {
            time = t;
            self.update();
        }
    };

    self.getTime = function() {
        return time;
    };

    self.setDuration = function(d) {
        duration = (d === null || d <= 0) ? 100000 : d;
    };

    self.getDuration = function() {
        return duration;
    };

    self.setPosition = function(p) {
        self.prevPos = pos;
        //var a = self.suffixe != '' ? self.suffixe : '';
        self.propFunc(p);
        //+ a;
        //self.obj(Math.round(p));
        pos = p;
        self.broadcastMessage('onChanged', {
            target: this,
            type: 'onChanged'
        });
    };

    self.getPosition = function(t) {
        if (t === undefined) {
            t = time;
        }
        return self.func(t, self.begin, change, duration);
    };

    self.setFinish = function(f) {
        change = f - self.begin;
    };

    self.getFinish = function() {
        return self.begin + change;
    };

    self.start = function() {
        self.rewind();
        self.startEnterFrame();
        self.broadcastMessage('onStarted', {
            target: this,
            type: 'onStarted'
        });
    };

    self.rewind = function(t) {
        self.stop();
        time = (t === undefined) ? 0 : t;
        self.fixTime();
        self.update();
    };

    self.fforward = function() {
        time = duration;
        self.fixTime();
        self.update();
    };

    self.update = function() {
        self.setPosition(self.getPosition(time));
    };

    self.startEnterFrame = function() {
        self.stopEnterFrame();
        self.isPlaying = true;
        self.onEnterFrame();
    };

    self.onEnterFrame = function() {
        if (self.isPlaying) {
            self.nextFrame();
        }
    };

    self.nextFrame = function() {
        self.setTime((self.getTimer() - startTime) / 1000);
    };

    self.stop = function() {
        self.stopEnterFrame();
        self.broadcastMessage('onStopped', {
            target: this,
            type: 'onStopped'
        });
    };

    self.stopEnterFrame = function() {
        self.isPlaying = false;
    };

    self.continueTo = function(finish, duration) {
        self.begin = pos;
        self.setFinish(finish);
        if (duration !== undefined) self.setDuration(duration);
        self.start();
    };

    self.resume = function() {
        self.fixTime();
        self.startEnterFrame();
        self.broadcastMessage('onResumed', {
            target: this,
            type: 'onResumed'
        });
    };

    self.yoyo = function() {
        self.continueTo(self.begin, time);
    };

    self.addListener = function(o) {
        self.removeListener(o);
        return listeners.push(o);
    };

    self.removeListener = function(o) {
        var a = listeners;
        var i = a.length;
        while (i--) {
            if (a[i] == o) {
                a.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    self.broadcastMessage = function() {
        var arr = [],i;
        for (i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
        var e = arr.shift();
        var a = listeners;
        var l = a.length;
        for (i = 0; i < l; i++) {
            if (a[i][e]) {
                a[i][e].apply(a[i], arr);
            }
        }
    };

    self.fixTime = function() {
        startTime = self.getTimer() - time * 1000;
    };

    self.getTimer = function() {
        return new Date().getTime() - time;
    };
})();

Tweens = {
    backEaseIn: function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    backEaseOut: function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    backEaseInOut: function(t, b, c, d, a, p) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    elasticEaseIn: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    elasticEaseOut: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    elasticEaseInOut: function(t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) == 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    bounceEaseOut: function(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    bounceEaseIn: function(t, b, c, d) {
        return c - Tweens.bounceEaseOut(d - t, 0, c, d) + b;
    },
    bounceEaseInOut: function(t, b, c, d) {
        if (t < d / 2) {
            return Tweens.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        } else {
            return Tweens.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    easeIn: function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOut: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    strongEaseIn: function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    strongEaseOut: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    strongEaseInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    linear: function(t, b, c, d) {
        return c * t / d + b;
    }
};
