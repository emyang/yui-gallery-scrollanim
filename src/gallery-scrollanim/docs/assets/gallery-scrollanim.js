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
        TOUCH = Modernizr.touch ? true : false;

    function ScrollAnim(cfg) {

        // Invoke Base constructor, passing through arguments
        ScrollAnim.superclass.constructor.apply(this, arguments);

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
        /*slideHeight: {
            value: NULL,
            setter: function (slideHeight) {
                if (!LANG.isNumber(slideHeight)) {
                    Y.log('ScrollAnim: slideHeight must contain only numbers (in pixels): ' + slideHeight, 'error');
                    return ATTRIBUTE.INVALID_VALUE;
                }
                return slideHeight;
            },
            writeOnce: "initOnly"
        },*/
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
