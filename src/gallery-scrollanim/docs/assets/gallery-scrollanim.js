/*jslint sloppy: true */
/*globals setInterval, clearInterval */

/**
 * Copyright (c) 2010-2012 Tween.js authors.
 * Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/
 * @author sole / http://soledadpenades.com
 * @author mr.doob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * Licensed under the MIT (https://github.com/sole/tween.js/blob/master/LICENSE) license.
 */

var TWEEN = TWEEN || (function () {

    var i, interval, fps = 60, autostart = false, tweens = [];

    return {

        setFPS: function (f) {

            fps = f || 60;

        },

        start: function (f) {

            if (arguments.length !== 0) {
                this.setFPS(f);
            }

            interval = setInterval(this.update, 1000 / fps);

        },

        stop: function () {

            clearInterval(interval);

        },

        setAutostart: function (value) {

            autostart = value;

            if (autostart && !interval) {
                this.start();
            }

        },

        add: function (tween) {

            tweens.push(tween);

            if (autostart && !interval) {

                this.start();

            }

        },

        getAll: function () {

            return tweens;

        },

        removeAll: function () {

            tweens = [];

        },

        remove: function (tween) {

            i = tweens.indexOf(tween);

            if (i !== -1) {

                tweens.splice(i, 1);

            }

        },

        update: function (a_time) {

            var i = 0, num_tweens = tweens.length,
                time = a_time || new Date().getTime();

            while (i < num_tweens) {

                if (tweens[i].update(time)) {

                    i += 1;

                } else {

                    tweens.splice(i, 1);
                    num_tweens -= 1;

                }

            }

            if (num_tweens === 0 && autostart === true) {

                this.stop();

            }

        }

    };

}());

TWEEN.Tween = function (object) {

    var a_object = object,
        a_valuesStart = {},
        a_valuesDelta = {},
        a_valuesEnd = {},
        a_duration = 1000,
        a_delayTime = 0,
        a_startTime = null,
        a_easingFunction = TWEEN.Easing.Linear.EaseNone,
        a_chainedTween = null,
        a_onUpdateCallback = null,
        a_onCompleteCallback = null;

    this.to = function (properties, duration) {
        var property;

        if (duration !== null) {

            a_duration = duration;

        }

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {

                // This prevents the engine from interpolating null values
                if (a_object[property] !== null) {

                    // The current values are read when the tween starts;
                    // here we only store the final desired values
                    a_valuesEnd[property] = properties[property];

                }
            }
        }

        return this;

    };

    this.start = function (a_time) {
        var property;

        TWEEN.add(this);

        a_startTime = a_time ? a_time + a_delayTime : new Date().getTime() + a_delayTime;

        for (property in a_valuesEnd) {
            if (a_valuesEnd.hasOwnProperty(property)) {
                // Again, prevent dealing with null values
                if (a_object[property] !== null) {

                    a_valuesStart[property] = a_object[property];
                    a_valuesDelta[property] = a_valuesEnd[property] - a_object[property];

                }

            }
        }

        return this;
    };

    this.stop = function () {

        TWEEN.remove(this);
        return this;

    };

    this.delay = function (amount) {

        a_delayTime = amount;
        return this;

    };

    this.easing = function (easing) {

        a_easingFunction = easing;
        return this;

    };

    this.chain = function (chainedTween) {

        a_chainedTween = chainedTween;
        return this;

    };

    this.onUpdate = function (onUpdateCallback) {

        a_onUpdateCallback = onUpdateCallback;
        return this;

    };

    this.onComplete = function (onCompleteCallback) {

        a_onCompleteCallback = onCompleteCallback;
        return this;

    };

    this.update = function (time) {

        var property, elapsed, value;

        if (time < a_startTime) {

            return true;

        }

        elapsed = (time - a_startTime) / a_duration;
        elapsed = elapsed > 1 ? 1 : elapsed;

        value = a_easingFunction(elapsed);

        for (property in a_valuesDelta) {
            if (a_valuesDelta.hasOwnProperty(property)) {
                a_object[property] = a_valuesStart[property] + a_valuesDelta[property] * value;
            }
        }

        if (a_onUpdateCallback !== null) {

            a_onUpdateCallback.call(a_object, value);

        }

        if (elapsed === 1) {

            if (a_onCompleteCallback !== null) {

                a_onCompleteCallback.call(a_object);

            }

            if (a_chainedTween !== null) {

                a_chainedTween.start();

            }

            return false;

        }

        return true;

    };

    /*
     this.destroy = function () {

     TWEEN.remove( this );

     };
     */
};

TWEEN.Easing = { Linear: {}, Quadratic: {}, Cubic: {}, Quartic: {}, Quintic: {}, Sinusoidal: {}, Exponential: {}, Circular: {}, Elastic: {}, Back: {}, Bounce: {} };


TWEEN.Easing.Linear.EaseNone = function (k) {

    return k;

};

//

TWEEN.Easing.Quadratic.EaseIn = function (k) {

    return k * k;

};

TWEEN.Easing.Quadratic.EaseOut = function (k) {

    return -k * (k - 2);

};

TWEEN.Easing.Quadratic.EaseInOut = function (k) {

    if ((k *= 2) < 1) {
        return 0.5 * k * k;
    }
    return -0.5 * ((k -= 1) * (k - 2) - 1);

};

//

TWEEN.Easing.Cubic.EaseIn = function (k) {

    return k * k * k;

};

TWEEN.Easing.Cubic.EaseOut = function (k) {

    return (k -= 1) * k * k + 1;

};

TWEEN.Easing.Cubic.EaseInOut = function (k) {

    if ((k *= 2) < 1) {
        return 0.5 * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k + 2);

};

//

TWEEN.Easing.Quartic.EaseIn = function (k) {

    return k * k * k * k;

};

TWEEN.Easing.Quartic.EaseOut = function (k) {

    return -((k -= 1) * k * k * k - 1);

};

TWEEN.Easing.Quartic.EaseInOut = function (k) {

    if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k;
    }
    return -0.5 * ((k -= 2) * k * k * k - 2);

};

//

TWEEN.Easing.Quintic.EaseIn = function (k) {

    return k * k * k * k * k;

};

TWEEN.Easing.Quintic.EaseOut = function (k) {

    return (k = k - 1) * k * k * k * k + 1;

};

TWEEN.Easing.Quintic.EaseInOut = function (k) {

    if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2);

};

// 

TWEEN.Easing.Sinusoidal.EaseIn = function (k) {

    return -Math.cos(k * Math.PI / 2) + 1;

};

TWEEN.Easing.Sinusoidal.EaseOut = function (k) {

    return Math.sin(k * Math.PI / 2);

};

TWEEN.Easing.Sinusoidal.EaseInOut = function (k) {

    return -0.5 * (Math.cos(Math.PI * k) - 1);

};

//

TWEEN.Easing.Exponential.EaseIn = function (k) {

    return k === 0 ? 0 : Math.pow(2, 10 * (k - 1));

};

TWEEN.Easing.Exponential.EaseOut = function (k) {

    return k === 1 ? 1 : -Math.pow(2, -10 * k) + 1;

};

TWEEN.Easing.Exponential.EaseInOut = function (k) {

    if (k === 0) {
        return 0;
    }

    if (k === 1) {
        return 1;
    }

    if ((k *= 2) < 1) {
        return 0.5 * Math.pow(2, 10 * (k - 1));
    }

    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);

};

// 

TWEEN.Easing.Circular.EaseIn = function (k) {

    return -(Math.sqrt(1 - k * k) - 1);

};

TWEEN.Easing.Circular.EaseOut = function (k) {

    return Math.sqrt(1 - (k - 1) * k);

};

TWEEN.Easing.Circular.EaseInOut = function (k) {

    if ((k /= 0.5) < 1) {
        return -0.5 * (Math.sqrt(1 - k * k) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

};

//

TWEEN.Easing.Elastic.EaseIn = function (k) {

    var s, a = 0.1, p = 0.4;
    if (k === 0) {
        return 0;
    }

    if (k === 1) {
        return 1;
    }

    if (!p) {
        p = 0.3;
    }

    if (!a || a < 1) {
        a = 1;
        s = p / 4;
    } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
    }

    return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
};

TWEEN.Easing.Elastic.EaseOut = function (k) {

    var s, a = 0.1, p = 0.4;
    if (k === 0) {
        return 0;
    }

    if (k === 1) {
        return 1;
    }

    if (!p) {
        p = 0.3;
    }

    if (!a || a < 1) {
        a = 1;
        s = p / 4;
    } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
    }

    return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
};

TWEEN.Easing.Elastic.EaseInOut = function (k) {

    var s, a = 0.1, p = 0.4;
    if (k === 0) {
        return 0;
    }

    if (k === 1) {
        return 1;
    }

    if (!p) {
        p = 0.3;
    }

    if (!a || a < 1) {
        a = 1;
        s = p / 4;
    } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
    }

    if ((k *= 2) < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    }

    return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
};

//

TWEEN.Easing.Back.EaseIn = function (k) {

    var s = 1.70158;
    return k * k * ((s + 1) * k - s);

};

TWEEN.Easing.Back.EaseOut = function (k) {

    var s = 1.70158;
    return (k = k - 1) * k * ((s + 1) * k + s) + 1;

};

TWEEN.Easing.Back.EaseInOut = function (k) {

    var s = 1.70158 * 1.525;
    if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s));
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

};

// 

TWEEN.Easing.Bounce.EaseIn = function (k) {

    return 1 - TWEEN.Easing.Bounce.EaseOut(1 - k);

};

TWEEN.Easing.Bounce.EaseOut = function (k) {

    if ((k /= 1) < (1 / 2.75)) {
        return 7.5625 * k * k;
    }

    if (k < (2 / 2.75)) {
        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
    }

    if (k < (2.5 / 2.75)) {
        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
    }

    return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
};

TWEEN.Easing.Bounce.EaseInOut = function (k) {

    if (k < 0.5) {
        return TWEEN.Easing.Bounce.EaseIn(k * 2) * 0.5;
    }
    return TWEEN.Easing.Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;

};

/*global YUI,Modernizr,window,TWEEN*/
/*jslint nomen: true*/
YUI.add('gallery-scrollanim', function (Y) {
    'use strict';

    var ATTRIBUTE = Y.Attribute,
        LANG = Y.Lang,
        ARRAY = Y.Array,
        OBJECT = Y.Object,
        TRUE = true,
        FALSE = false,
        NULL = null,
        d = Y.one('document'),
        w = Y.one('window'),
        TOUCH = false; //Default is a Descktop Enviroment

    function ScrollAnim(cfg) {
        // Invoke Base constructor, passing through arguments
        ScrollAnim.superclass.constructor.apply(this, arguments);
        //Touch is part of the configuration (boolean)
        if (cfg.touchEnale) {
            this.TOUCH = cfg.touchEnale;
        }
    }

    ScrollAnim.NAME = "scrollAnim";

    ScrollAnim.ATTRS = {
        node: {
            value: NULL,
            setter: function (node) {
                var n = Y.one(node);
                if (!n) {
                    Y.fail('ScrollAnim: Invalid node given: ' + node, 'error');
                    return ATTRIBUTE.INVALID_VALUE;
                }
                return n;
            },
            writeOnce: "initOnly"
        },
        animations: {
            value: NULL,
            setter: function (animations) {
                if (!LANG.isArray(animations)) {
                    Y.log('ScrollAnim: Invalid param animations. animations must be an array of objects: ' + animations, 'error');
                    return ATTRIBUTE.INVALID_VALUE;
                }
                ARRAY.each(animations, function (animObj) {

                    var node;

                    if (!LANG.isObject(animObj)) {
                        Y.log('ScrollAnim: Invalid param animations. animations must be an array of objects: ' + animations, 'error');
                        return ATTRIBUTE.INVALID_VALUE;
                    } else {
                        node = Y.one(animObj.selector);
                        if (!animObj.selector) {
                            Y.log('ScrollAnim: Invalid param animations. animation object contain an invalid selector: ' + animations, 'error');
                            return ATTRIBUTE.INVALID_VALUE;
                        }
                        animObj.node = node;
                        //animObj.offsetTop = node.get('offsetTop');
                    }
                });

                return animations;
            }
        },
        slideHeight: {
            value: NULL,
            setter: function (slideHeight) {
                if (!LANG.isNumber(slideHeight)) {
                    Y.log('ScrollAnim: slideHeight must contain only numbers (in pixels): ' + slideHeight, 'error');
                    return ATTRIBUTE.INVALID_VALUE;
                }
                return slideHeight;
            },
            writeOnce: "initOnly"
        },
        maxScroll: {
            value: {
                value: 1000
            }
        },
        tickSpeed: {
            value: 100
        },
        scrollSpeed: {
            value: 20
        },
        useRAF: {
            value: true
        },
        tweenSpeed: {
            value: 0.3
        },
        startAt: {
            value: 0
        },
        onStart: {
            value: null
        },
        onResize: {
            value: null
        },
        onUpdate: {
            value: null
        }
    };

    Y.extend(ScrollAnim, Y.Base, {

        keyframe: 0,

        settings: {},

        page: null,

        started: false,

        paused: false,

        animation: null,

        touch: false, // is touch device

        touchStart: {
            x: 0,
            y: 0
        }, // vars for touch

        scrollStart: 0, // vars for scroll

        scrollTopTweened: 0,

        scrollTop: 0,

        scrollDirection: 0,

        autoScrollInterval: 0,

        initializer: function (cfg) {
            // initialize
            var node = this.get('node'),
                anims = this.get('animations'),
                useRAF = this.get('useRAF'),
                tickSpeed = this.get('tickSpeed');

            this.settings = cfg;
            this.animation = anims;

            // requestAnimationFrame polyfill
            this.requestAnimationFramePolyfill();

            if (TOUCH) {
                node.on('touchstart', Y.bind(this.touchStartHandler, this));
                node.on('touchmove', Y.bind(this.touchMoveHandler, this));
                node.on('touchend', Y.bind(this.touchEndHandler, this));
            }

            Y.on('mousewheel', Y.bind(this.wheelHandler, this));
            Y.on('resize', Y.bind(this.resizeHandler, this));

            this.resize();
        },

        requestAnimationFramePolyfill: function () {

            // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
            // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating           
            // requestAnimationFrame polyfill by Erik M√∂ller
            // fixes from Paul Irish and Tino Zijdel

            var lastTime = 0,
                vendors = ['ms', 'moz', 'webkit', 'o'],
                x;

            for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback, element) {

                    var currTime = new Date().getTime(),
                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                        id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        }, timeToCall);

                    lastTime = currTime + timeToCall;

                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            }
        },

        resize: function () {
            var container = this.get('node'),
                width = parseInt(container.getComputedStyle('width'), 10),
                height = parseInt(container.getComputedStyle('height'), 10),
                onResize = this.get('onResize');

            this.page = {
                wWidth: width,
                wHeight: height,
                wCenter: {
                    left: width / 2,
                    top: height / 2
                }
            };

            // onResize callback
            if (onResize && typeof onResize === 'function') {
                onResize(this.page);
            }

            this.resetAnimatable();
            this.setAnimatable();
            this.start();
        },

        start: function () {
            var startAt = Y.Lang.isFunction(this.get('startAt')) ? this.get('startAt')() : this.get('startAt'),
                onStart = this.get('onStart');

            if (!this.started && startAt) {
                this.scrollTopTweened = this.scrollTop = startAt;
            }

            // trigger first anim
            this.scrollTop += 1;

            if (!this.started) {
                this.animationLoop();
                this.started = true;
            }

            // remove so 1px of scroll otherwise it will keep scrolling onresize
            this.scrollTop -= 1;

            if (onStart && typeof onStart === 'function') {
                onStart();
            }
        },

        animationLoop: function () {

            window.requestAnimationFrame(Y.bind(this.animationLoop, this));

            if (this.paused) {
                return;
            }

            var tweenSpeed = this.get('tweenSpeed'),
                animation = this.animation,
                anim,
                i,
                onUpdate = this.get('onUpdate'),
                startAt,
                endAt;

            if (Math.ceil(this.scrollTopTweened) !== Math.floor(this.scrollTop)) {
                //Smooth out scrolling action
                this.scrollTopTweened += tweenSpeed * (this.scrollTop - this.scrollTopTweened);
                this.scrollTopTweened = Math.round(this.scrollTopTweened * 100) / 100;

                //Direction
                this.scrollDirection = this.scrollTop > this.scrollTopTweened ? 1 : -1;

                for (i in animation) {
                    if (animation.hasOwnProperty(i)) {
                        anim = animation[i];

                        startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt;
                        endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

                        // check if animation is in range
                        if (this.scrollTopTweened >= startAt && this.scrollTopTweened <= endAt) {
                            this.startAnimatable(anim);
                            this.render(anim);
                        } else {
                            this.stopAnimatable(anim);
                        }
                    }
                }

                // onAnimate callback
                if (onUpdate && typeof onUpdate === 'function') {
                    onUpdate(this.scrollTopTweened);
                }

            }
        },

        render: function (anim) {
            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,
                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt,
                progress = (startAt - this.scrollTopTweened) / (startAt - endAt), //Calculate animation progress %
                properties = {}, //Create new CSS properties map
                i,
                keyframe, //Current animation keyframe
                lastkeyframe, //Last animation keyframe
                keyframeProgress, //Keyframe progress %
                property, //Single CSS property
                startValues, //Start values of CSS property
                endValues, //End values of CSS property
                result, //For background-position CSS property value
                propertyVal, //Property value if property is a function
                lastPropertyVal; //Property value if property is a function

            //Clamp progress between 0 and 100 percent (render is always called 1 lst time at the end to clean up)
            progress = Math.max(0, Math.min(1, progress));
            anim.lastProgress = progress;

            //Check and run keyframes within scroll range
            if (anim.keyframes) {
                for (i = 1; i < anim.keyframes.length; i += 1) {
                    keyframe = anim.keyframes[i];
                    lastkeyframe = anim.keyframes[i - 1];
                    keyframeProgress = (lastkeyframe.position - progress) / (lastkeyframe.position - keyframe.position);

                    if (keyframeProgress >= 0 && keyframeProgress <= 1) {

                        if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {
                            keyframe.onProgress(keyframeProgress, this.scrollDirection);
                        }

                        for (property in keyframe.properties) {
                            if (keyframe.properties.hasOwnProperty(property)) {
                                //Are we animating a background in more than X?
                                if (property === "background-position" && keyframe.properties[property].hasOwnProperty("x")) {
                                    //Process the object
                                    startValues = Y.clone(keyframe.properties[property]);
                                    endValues = Y.clone(lastkeyframe.properties[property]);
                                    result = "";

                                    // normalize it
                                    if (Y.Lang.isFunction(startValues.x)) {
                                        startValues.x = startValues.x();
                                    }
                                    if (Y.Lang.isFunction(startValues.y)) {
                                        startValues.y = startValues.y();
                                    }
                                    if (Y.Lang.isFunction(endValues.x)) {
                                        endValues.x = endValues.x();
                                    }
                                    if (Y.Lang.isFunction(endValues.y)) {
                                        endValues.y = endValues.y();
                                    }

                                    if (typeof startValues.x === "number") {
                                        result += this.getTweenedValue(endValues.x, startValues.x, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        result += startValues.x;
                                    }
                                    result += " ";
                                    if (typeof startValues.y === "number") {
                                        result += this.getTweenedValue(endValues.y, startValues.y, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        result += startValues.y;
                                    }
                                    properties.backgroundPosition = result;
                                } else {
                                    //Just tween the value otherwise
                                    if (Y.Lang.isFunction(keyframe.properties[property])) {
                                        propertyVal = keyframe.properties[property]();
                                    } else {
                                        propertyVal = keyframe.properties[property];
                                    }
                                    if (Y.Lang.isFunction(lastkeyframe.properties[property])) {
                                        lastPropertyVal = lastkeyframe.properties[property]();
                                    } else {
                                        lastPropertyVal = lastkeyframe.properties[property];
                                    }
                                    properties[property] = this.getTweenedValue(lastPropertyVal, propertyVal, keyframeProgress, 1, keyframe.ease);
                                }
                            }
                        }
                    }
                }
            }

            // Apply all tweened css styles
            anim.node.setStyles(properties);

            // onProgress callback (not really used)
            if (anim.onProgress && typeof anim.onProgress === 'function') {
                anim.onProgress(anim, progress);
            }
        },

        destructor: function () {
            // destroy
        },

        // Run before animation starts when animation is in range 
        startAnimatable: function (anim) {
            // apply start properties
            if (!anim._started) {
                if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {
                    anim.onStartAnimate(anim, this.scrollDirection);
                } else {
                    anim.node.setStyle('display', 'block');
                }

                anim._started = true;
            }
        },

        /* run after animation is out of range  */
        stopAnimatable: function (anim) {

            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,
                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

            // Apply end properties after items move out of range if they were running
            if (((anim._started && endAt < this.scrollTopTweened) || (anim._started && startAt > this.scrollTopTweened)) || (this.scrollDirection < 0 && anim.lastProgress > 0 && startAt > this.scrollTopTweened) || (this.scrollDirection > 0 && anim.lastProgress < 1 && endAt < this.scrollTopTweened)) {

                this.render(anim);

                if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {
                    anim.onEndAnimate(anim, this.scrollDirection);
                } else {
                    anim.node.setStyle('display', 'none');
                }
                anim._started = false;
            }
        },

        /**
         * Calls onInit() callbacks passed to the animation object and to each key frame
         * This function is called on init and on resize 
         */
        setAnimatable: function () {
            var animations = this.get('animations');

            Y.Object.each(animations, function (animation) {

                animation.lastProgress = 0;

                // onInit callback for each animation object
                if (LANG.isFunction(animation.onInit)) {
                    animation.onInit(animation);
                }

                // integrate through keyframes
                Y.Array.each(animation.keyframes, function (keyframe) {

                    var nextKeyframe;

                    // execute onInit callback for each keyframe
                    if (LANG.isFunction(keyframe.onInit)) {
                        keyframe.onInit(animation);
                    }

                });

            });
        },

        resetAnimatable: function () {
            var animation = this.get('animation'),
                anim,
                i;

            for (i in animation) {
                if (animation.hasOwnProperty(i)) {
                    anim = animation[i];
                    if (anim._started) {
                        //delete anim._elem;
                        delete anim._started;
                    }
                }
            }
        },

        /***** Event handlers *****/
        // scrollwheel event
        wheelHandler: function (e) {
            var scrollSpeed = this.get('scrollSpeed'),
                delta = e.wheelDelta;

            if (this.paused) {
                return;
            }

            this.scrollTop -= delta * scrollSpeed;

            if (this.scrollTop < 0) {
                this.scrollTop = 0;
            }

            this.checkScrollExtents();
        },

        // resize event
        resizeHandler: function (e) {
            this.resize();
        },

        scrollTo: function (scroll) {
            this.scrollTop = scroll;
        },

        // touch events
        touchStartHandler: function (e) {
            //alert('in touch start');
            //e.preventDefault();
            this.touchStart.x = e.touches[0].pageX;

            // Store the position of finger on swipe begin:
            this.touchStart.y = e.touches[0].pageY;

            // Store scroll val on swipe begin:
            this.scrollStart = this.scrollTop;
        },

        touchEndHandler: function (e) {

        },

        touchMoveHandler: function (e) {
            e.preventDefault();
            //alert('in touch move');
            if (this.paused) {
                return;
            }
            var offset = {};
            offset.x = this.touchStart.x - e.touches[0].pageX;

            // Get distance finger has moved since swipe begin:
            offset.y = this.touchStart.y - e.touches[0].pageY;

            if (Math.abs(offset.y) > Math.abs(offset.x)) {
                // Add finger move dist to original scroll value
                this.scrollTop = Math.max(0, this.scrollStart + offset.y);
                this.checkScrollExtents();
            }
        },

        /***** Utils *****/
        // Get tweened value based on animation progress
        getTweenedValue: function (start, end, currentTime, totalTime, tweener) {
            var delta = end - start,
                percentComplete = currentTime / totalTime;

            if (!tweener) {
                tweener = TWEEN.Easing.Linear.EaseNone;
            }

            return tweener(percentComplete) * delta + start;
        },
        // Keep scroll range between 0 and maximum scroll value
        checkScrollExtents: function () {
            var maxScroll = this.get('maxScroll').value;

            if (this.scrollTop < 0) {
                this.scrollTop = 0;
            } else if (this.scrollTop > maxScroll) {
                this.scrollTop = maxScroll;
            }
        }

    });

    Y.ScrollAnim = ScrollAnim;

}, '0.0.1', {
    requires: ['base', 'yui-throttle', 'transition', 'event-mousewheel', 'event-resize', 'event-touch']
});
