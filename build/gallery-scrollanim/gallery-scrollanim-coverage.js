if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/gallery-scrollanim/gallery-scrollanim.js",
    code: []
};
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].code=["YUI.add('gallery-scrollanim', function (Y, NAME) {","","/*"," * Copyright (c) 2013, Yahoo! Inc.  All rights reserved."," *"," * Redistribution and use of this software in source and binary forms,"," * with or without modification, are permitted provided that the following"," * conditions are met:"," *"," * - Redistributions of source code must retain the above"," *   copyright notice, this list of conditions and the"," *   following disclaimer."," *"," * - Redistributions in binary form must reproduce the above"," *   copyright notice, this list of conditions and the"," *   following disclaimer in the documentation and/or other"," *   materials provided with the distribution."," *"," * - Neither the name of Yahoo! Inc. nor the names of its"," *   contributors may be used to endorse or promote products"," *   derived from this software without specific prior"," *   written permission of Yahoo! Inc."," *"," * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS"," * IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED"," * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A"," * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT"," * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,"," * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT"," * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,"," * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY"," * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT"," * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE"," * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."," */","","/*global YUI,window,TWEEN*/","/*jslint nomen: true*/","","/**"," * This is a YUI module that animates HTML elements based on window.scrollTop property."," *"," * @author Emily Yang <emyang@yahoo-inc.com>"," * @author Renato Iwashima <renatoi@yahoo-inc.com>"," *"," * @module gallery-scrollanim"," */","    'use strict';","","    var ATTRIBUTE = Y.Attribute,","        LANG = Y.Lang,","        ARRAY = Y.Array,","        NULL = null,","        TOUCH = false; //Default is a Desktop Enviroment","","    /**","     * ScrollAnim provides a YUI module that can animate any HTML element based on","     * user's scroll position and supports both touch/mouse based devices.","     *","     * @class ScrolAnim","     * @param cfg {Object} Object literal with initial attribute values","     * @extends Base","     * @constructor","     */","    function ScrollAnim(cfg) {","        // Invoke Base constructor, passing through arguments","        ScrollAnim.superclass.constructor.apply(this, arguments);","        //Touch is part of the configuration (boolean)","        if (cfg.touchEnable) {","            TOUCH = cfg.touchEnable;","        }","    }","","    ScrollAnim.NAME = \"scrollAnim\";","    // configure the scroll anim instance","    ScrollAnim.ATTRS = {","        /**","        * Selector for main container that will wrap the whole content","        * @attribute node","        * @type {Object}","        * @default \"NULL\"","        */","        node: {","            value: NULL,","            setter: function (node) {","                var n = Y.one(node);","                if (!n) {","                    Y.fail('ScrollAnim: Invalid node given: ' + node, 'error');","                    return ATTRIBUTE.INVALID_VALUE;","                }","                return n;","            },","            writeOnce: \"initOnly\"","        },","        /**","        * Stores the animation configuration","        * @attribute animations","        * @type {Object}","        * @default \"NULL\"","        */","        animations: {","            value: NULL,","            setter: function (animations) {","                if (!LANG.isArray(animations)) {","                    return ATTRIBUTE.INVALID_VALUE;","                }","                ARRAY.each(animations, function (animObj) {","","                    var node;","","                    if (!LANG.isObject(animObj)) {","                        return ATTRIBUTE.INVALID_VALUE;","                    } else {","                        node = Y.one(animObj.selector);","                        if (!animObj.selector) {","                            return ATTRIBUTE.INVALID_VALUE;","                        }","                        animObj.node = node;","                        //animObj.offsetTop = node.get('offsetTop');","                    }","                });","","                return animations;","            }","        },","        /**","        * Set the max scroll height","        * @attribute maxScroll","        * @type Int","        * @default \"1000\"","        */","        maxScroll: {","            value: {","                value: 1000","            }","        },","        /**","        * Set interval (ms) if not using RAF (requestAnimationFrame)","        * @attribute tickSpeed","        * @type Int","        * @default \"100\"","        */","        tickSpeed: {","            value: 100","        },","        /**","        * Set the speed of the scroll","        * @attribute scrollSpeed","        * @type Int","        * @default \"20\"","        */","        scrollSpeed: {","            value: 20","        },","        /**","        * Set if the widget needs requestAnimationFrame (RAF)","        * @attribute useRAF","        * @type Boolean","        * @default \"true\"","        */","        useRAF: {","            value: true","        },","        /**","        * Set scrollTop tween speed","        * @attribute tweenSpeed","        * @type Int","        * @default \"0.3\"","        */","        tweenSpeed: {","            value: 0.3","        },","        /**","        * Set scrollTop where the experience starts","        * @attribute startAt","        * @type Int","        * @default \"0\"","        */","        startAt: {","            value: 0","        },","        /**","        * Set a function fired on scroll start","        * @attribute onStart","        * @type function","        * @default \"NULL\"","        */","        onStart: {","            value: null","        },","        /**","        * Set a function fired on whindows resize","        * @attribute onResize","        * @type function","        * @default \"NULL\"","        */","        onResize: {","            value: null","        },","        /**","        * Set a function fired on scroll status update","        * @attribute onUpdate","        * @type function","        * @default \"NULL\"","        */","        onUpdate: {","            value: null","        }","    };","","    Y.extend(ScrollAnim, Y.Base, {","","        keyframe: 0,","","        settings: {},","","        page: null,","","        started: false,","","        paused: false,","","        animation: null,","","        touch: false, // is touch device","","        touchStart: {","            x: 0,","            y: 0","        }, // vars for touch","","        scrollStart: 0, // vars for scroll","","        scrollTopTweened: 0,","","        scrollTop: 0,","","        scrollDirection: 0,","","        autoScrollInterval: 0,","","        /**","        * Initialize the animation and the node specified on Attributes. This function also init some events for scroll and touch","        * @method initializer","        * @param {Object | cfg} Configuration for the widget","        */","        initializer: function (cfg) {","            // initialize","            var node = this.get('node'),","                anims = this.get('animations');","","            this.settings = cfg;","            this.animation = anims;","","            // requestAnimationFrame polyfill","            this.requestAnimationFramePolyfill();","","            if (TOUCH) {","                node.on('touchstart', Y.bind(this.touchStartHandler, this));","                node.on('touchmove', Y.bind(this.touchMoveHandler, this));","                node.on('touchend', Y.bind(this.touchEndHandler, this));","            }","","            Y.on('mousewheel', Y.bind(this.wheelHandler, this));","            Y.on('resize', Y.bind(this.resizeHandler, this));","","            this.resize();","        },","","        /**","        * This function creates the animation work, it's used a timer loop to make changes every few milliseconds.","        * It comes from a 3er party js, modified to use YUI. Original reference:","        * http://paulirish.com/2011/requestanimationframe-for-smart-animating/","        * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating","        * requestAnimationFrame polyfill by Erik Mâˆšâˆ‚ller","        * fixes from Paul Irish and Tino Zijdel","        * @method requestAnimationFramePolyfill","        */","        requestAnimationFramePolyfill: function () {","","            var lastTime = 0,","                vendors = ['ms', 'moz', 'webkit', 'o'],","                x;","","            for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {","                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];","                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];","            }","","            if (!window.requestAnimationFrame) {","                window.requestAnimationFrame = function (callback) {","","                    var currTime = new Date().getTime(),","                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),","                        id = window.setTimeout(function () {","                            callback(currTime + timeToCall);","                        }, timeToCall);","","                    lastTime = currTime + timeToCall;","","                    return id;","                };","            }","","            if (!window.cancelAnimationFrame) {","                window.cancelAnimationFrame = function (id) {","                    clearTimeout(id);","                };","            }","        },","","        /**","        * This is the default function to handle the windows resize","        * @method resize","        */","        resize: function () {","            var container = this.get('node'),","                width = parseInt(container.getComputedStyle('width'), 10),","                height = parseInt(container.getComputedStyle('height'), 10),","                onResize = this.get('onResize');","","            this.page = {","                wWidth: width,","                wHeight: height,","                wCenter: {","                    left: width / 2,","                    top: height / 2","                }","            };","","            // onResize callback","            if (onResize && typeof onResize === 'function') {","                onResize(this.page);","            }","","            this.resetAnimatable();","            this.setAnimatable();","            this.start();","        },","","        /**","        * This is the default function to start the animation","        * @method start","        */","        start: function () {","            var startAt = Y.Lang.isFunction(this.get('startAt')) ? this.get('startAt')() : this.get('startAt'),","                onStart = this.get('onStart');","","            if (!this.started && startAt) {","                this.scrollTopTweened = this.scrollTop = startAt;","            }","","            // trigger first anim","            this.scrollTop += 1;","","            if (!this.started) {","                this.animationLoop();","                this.started = true;","            }","","            // remove so 1px of scroll otherwise it will keep scrolling onresize","            this.scrollTop -= 1;","","            if (onStart && typeof onStart === 'function') {","                onStart();","            }","        },","","        /**","        * This function determinates the direction and the animation time frame to make a smooth action.","        * It also check if the animation is in range.","        * @method animationLoop","        */","        animationLoop: function () {","","            window.requestAnimationFrame(Y.bind(this.animationLoop, this));","","            if (this.paused) {","                return;","            }","","            var tweenSpeed = this.get('tweenSpeed'),","                animation = this.animation,","                anim,","                i,","                onUpdate = this.get('onUpdate'),","                startAt,","                endAt;","","            if (Math.ceil(this.scrollTopTweened) !== Math.floor(this.scrollTop)) {","                //Smooth out scrolling action","                this.scrollTopTweened += tweenSpeed * (this.scrollTop - this.scrollTopTweened);","                this.scrollTopTweened = Math.round(this.scrollTopTweened * 100) / 100;","","                //Direction","                this.scrollDirection = this.scrollTop > this.scrollTopTweened ? 1 : -1;","","                for (i in animation) {","                    if (animation.hasOwnProperty(i)) {","                        anim = animation[i];","","                        startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt;","                        endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;","","                        // check if animation is in range","                        if (this.scrollTopTweened >= startAt && this.scrollTopTweened <= endAt) {","                            this.startAnimatable(anim);","                            this.render(anim);","                        } else {","                            this.stopAnimatable(anim);","                        }","                    }","                }","","                // onAnimate callback","                if (onUpdate && typeof onUpdate === 'function') {","                    onUpdate(this.scrollTopTweened);","                }","","            }","        },","","        /**","        * @method render","        */","        render: function (anim) {","            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,","                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt,","                progress = (startAt - this.scrollTopTweened) / (startAt - endAt), //Calculate animation progress %","                properties = {}, //Create new CSS properties map","                i,","                keyframe, //Current animation keyframe","                lastkeyframe, //Last animation keyframe","                keyframeProgress, //Keyframe progress %","                property, //Single CSS property","                startValues, //Start values of CSS property","                endValues, //End values of CSS property","                result, //For background-position CSS property value","                propertyVal, //Property value if property is a function","                lastPropertyVal; //Property value if property is a function","","            //Clamp progress between 0 and 100 percent (render is always called 1 lst time at the end to clean up)","            progress = Math.max(0, Math.min(1, progress));","            anim.lastProgress = progress;","","            //Check and run keyframes within scroll range","            if (anim.keyframes) {","                for (i = 1; i < anim.keyframes.length; i += 1) {","                    keyframe = anim.keyframes[i];","                    lastkeyframe = anim.keyframes[i - 1];","                    keyframeProgress = (lastkeyframe.position - progress) / (lastkeyframe.position - keyframe.position);","","                    if (keyframeProgress >= 0 && keyframeProgress <= 1) {","","                        if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {","                            keyframe.onProgress(keyframeProgress, this.scrollDirection);","                        }","","                        for (property in keyframe.properties) {","                            if (keyframe.properties.hasOwnProperty(property)) {","                                //Are we animating a background in more than X?","                                if (property === \"background-position\" && keyframe.properties[property].hasOwnProperty(\"x\")) {","                                    //Process the object","                                    startValues = Y.clone(keyframe.properties[property]);","                                    endValues = Y.clone(lastkeyframe.properties[property]);","                                    result = \"\";","","                                    // normalize it","                                    if (Y.Lang.isFunction(startValues.x)) {","                                        startValues.x = startValues.x();","                                    }","                                    if (Y.Lang.isFunction(startValues.y)) {","                                        startValues.y = startValues.y();","                                    }","                                    if (Y.Lang.isFunction(endValues.x)) {","                                        endValues.x = endValues.x();","                                    }","                                    if (Y.Lang.isFunction(endValues.y)) {","                                        endValues.y = endValues.y();","                                    }","","                                    if (typeof startValues.x === \"number\") {","                                        result += this.getTweenedValue(endValues.x, startValues.x, keyframeProgress, 1, keyframe.ease) + \"px\";","                                    } else {","                                        result += startValues.x;","                                    }","                                    result += \" \";","                                    if (typeof startValues.y === \"number\") {","                                        result += this.getTweenedValue(endValues.y, startValues.y, keyframeProgress, 1, keyframe.ease) + \"px\";","                                    } else {","                                        result += startValues.y;","                                    }","                                    properties.backgroundPosition = result;","                                } else {","                                    //Just tween the value otherwise","                                    if (Y.Lang.isFunction(keyframe.properties[property])) {","                                        propertyVal = keyframe.properties[property]();","                                    } else {","                                        propertyVal = keyframe.properties[property];","                                    }","                                    if (Y.Lang.isFunction(lastkeyframe.properties[property])) {","                                        lastPropertyVal = lastkeyframe.properties[property]();","                                    } else {","                                        lastPropertyVal = lastkeyframe.properties[property];","                                    }","                                    properties[property] = this.getTweenedValue(lastPropertyVal, propertyVal, keyframeProgress, 1, keyframe.ease);","                                }","                            }","                        }","                    }","                }","            }","","            // Apply all tweened css styles","            anim.node.setStyles(properties);","","            // onProgress callback (not really used)","            if (anim.onProgress && typeof anim.onProgress === 'function') {","                anim.onProgress(anim, progress);","            }","        },","","        destructor: function () {","            // destroy","        },","","        /**","        * This function runs before animation starts when animation is in range","        * @method startAnimatable","        * @param {Object | anim} animation instance","        */","        startAnimatable: function (anim) {","            // apply start properties","            if (!anim._started) {","                if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {","                    anim.onStartAnimate(anim, this.scrollDirection);","                } else {","                    anim.node.setStyle('display', 'block');","                }","","                anim._started = true;","            }","        },","","        /**","        * This function runs after animation is out of range","        * @method stopAnimatable","        * @param {Object | anim} animation instance","        */","        stopAnimatable: function (anim) {","","            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,","                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;","","            // Apply end properties after items move out of range if they were running","            if (((anim._started && endAt < this.scrollTopTweened) || (anim._started && startAt > this.scrollTopTweened)) ||","                    (this.scrollDirection < 0 && anim.lastProgress > 0 && startAt > this.scrollTopTweened) ||","                    (this.scrollDirection > 0 && anim.lastProgress < 1 && endAt < this.scrollTopTweened)) {","","                this.render(anim);","","                if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {","                    anim.onEndAnimate(anim, this.scrollDirection);","                }/* else {","                    anim.node.setStyle('display', 'none');","                }*/","                anim._started = false;","            }","        },","","        /**","        * Calls onInit() callbacks passed to the animation object and to each key frame","        * This function is called on init and on resize","        * @method setAnimatable","        */","        setAnimatable: function () {","            var animations = this.get('animations');","","            Y.Object.each(animations, function (animation) {","","                animation.lastProgress = 0;","","                // onInit callback for each animation object","                if (LANG.isFunction(animation.onInit)) {","                    animation.onInit(animation);","                }","","                // integrate through keyframes","                Y.Array.each(animation.keyframes, function (keyframe) {","","                    // execute onInit callback for each keyframe","                    if (LANG.isFunction(keyframe.onInit)) {","                        keyframe.onInit(animation);","                    }","","                });","","            });","        },","","        /**","        * @method resetAnimatable","        */","        resetAnimatable: function () {","            var animation = this.get('animation'),","                anim,","                i;","","            for (i in animation) {","                if (animation.hasOwnProperty(i)) {","                    anim = animation[i];","                    if (anim._started) {","                        //delete anim._elem;","                        delete anim._started;","                    }","                }","            }","        },","","        /***** Event handlers *****/","        /**","        * Mouse wheel event handler. This function will allow the mouse wheel interaction.","        * @method wheelHandler","        * @param {Event | e } asociated event","        */","        wheelHandler: function (e) {","            var scrollSpeed = this.get('scrollSpeed'),","                delta = e.wheelDelta;","","            if (this.paused) {","                return;","            }","","            this.scrollTop -= delta * scrollSpeed;","","            if (this.scrollTop < 0) {","                this.scrollTop = 0;","            }","","            this.checkMaxScroll();","        },","","        /**","        * Windows resize event handler. This function will be fired on windows resize.","        * @method resizeHandler","        */","        resizeHandler: function () {","            this.resize();","        },","","        /**","        * @method scrollTo","        * @param {Object | scroll } scroll","        */","        scrollTo: function (scroll) {","            this.scrollTop = scroll;","        },","","        /**","        * On start touch event handler. This function Store the position of finger on","        * swipe begin and set the scroll val on swipe begin.","        * @method touchStartHandler","        * @param {Event | e } asociated event","        */","        touchStartHandler: function (e) {","            //alert('in touch start');","            //e.preventDefault();","            this.touchStart.x = e.touches[0].pageX;","","            // Store the position of finger on swipe begin:","            this.touchStart.y = e.touches[0].pageY;","","            // Store scroll val on swipe begin:","            this.scrollStart = this.scrollTop;","        },","","        touchEndHandler: function () {","","        },","","        /**","        * On touch move event handler. This function gets distance finger has moved since swipe begin","        * and add it to original scroll value.","        * @method touchMoveHandler","        * @param {Event | e } asociated event","        */","        touchMoveHandler: function (e) {","            e.preventDefault();","            //alert('in touch move');","            if (this.paused) {","                return;","            }","            var offset = {};","            offset.x = this.touchStart.x - e.touches[0].pageX;","","            // Get distance finger has moved since swipe begin:","            offset.y = this.touchStart.y - e.touches[0].pageY;","","            if (Math.abs(offset.y) > Math.abs(offset.x)) {","                // Add finger move dist to original scroll value","                this.scrollTop = Math.max(0, this.scrollStart + offset.y);","                this.checkMaxScroll();","            }","        },","","        /***** Utils *****/","        /**","        * Get tweened value based on animation progress","        * @method getTweenedValue","        * @param {Int | start } start position","        * @param {Int | end } end position","        * @param {Int | currentTime } Time passed since the animation start","        * @param {Int | totalTime } Total estimated time","        * @param {Object | tweener } TWEEN instance","        * @return {Int} Tweened value","        */","        getTweenedValue: function (start, end, currentTime, totalTime, tweener) {","            var delta = end - start,","                percentComplete = currentTime / totalTime;","","            if (!tweener) {","                tweener = TWEEN.Easing.Linear.EaseNone;","            }","","            return tweener(percentComplete) * delta + start;","        },","        /**","        * Keep scroll range between 0 and maximum scroll value","        * @method checkMaxScroll","        */","        checkMaxScroll: function () {","            var maxScroll = this.get('maxScroll').value;","","            if (this.scrollTop < 0) {","                this.scrollTop = 0;","            } else if (this.scrollTop > maxScroll) {","                this.scrollTop = maxScroll;","            }","        }","","    });","","    Y.ScrollAnim = ScrollAnim;","","}, '0.0.1', {","    \"requires\": [","        \"base\",","        \"widget\",","        \"yui-throttle\",","        \"transition\",","        \"event-mousewheel\",","        \"event-resize\",","        \"event-touch\"","    ],","    \"skinnable\": false","});"];
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].lines = {"1":0,"48":0,"50":0,"65":0,"67":0,"69":0,"70":0,"74":0,"76":0,"86":0,"87":0,"88":0,"89":0,"91":0,"104":0,"105":0,"107":0,"109":0,"111":0,"112":0,"114":0,"115":0,"116":0,"118":0,"123":0,"211":0,"249":0,"252":0,"253":0,"256":0,"258":0,"259":0,"260":0,"261":0,"264":0,"265":0,"267":0,"281":0,"285":0,"286":0,"287":0,"290":0,"291":0,"293":0,"296":0,"299":0,"301":0,"305":0,"306":0,"307":0,"317":0,"322":0,"332":0,"333":0,"336":0,"337":0,"338":0,"346":0,"349":0,"350":0,"354":0,"356":0,"357":0,"358":0,"362":0,"364":0,"365":0,"376":0,"378":0,"379":0,"382":0,"390":0,"392":0,"393":0,"396":0,"398":0,"399":0,"400":0,"402":0,"403":0,"406":0,"407":0,"408":0,"410":0,"416":0,"417":0,"427":0,"443":0,"444":0,"447":0,"448":0,"449":0,"450":0,"451":0,"453":0,"455":0,"456":0,"459":0,"460":0,"462":0,"464":0,"465":0,"466":0,"469":0,"470":0,"472":0,"473":0,"475":0,"476":0,"478":0,"479":0,"482":0,"483":0,"485":0,"487":0,"488":0,"489":0,"491":0,"493":0,"496":0,"497":0,"499":0,"501":0,"502":0,"504":0,"506":0,"515":0,"518":0,"519":0,"534":0,"535":0,"536":0,"538":0,"541":0,"552":0,"556":0,"560":0,"562":0,"563":0,"567":0,"577":0,"579":0,"581":0,"584":0,"585":0,"589":0,"592":0,"593":0,"605":0,"609":0,"610":0,"611":0,"612":0,"614":0,"627":0,"630":0,"631":0,"634":0,"636":0,"637":0,"640":0,"648":0,"656":0,"668":0,"671":0,"674":0,"688":0,"690":0,"691":0,"693":0,"694":0,"697":0,"699":0,"701":0,"702":0,"718":0,"721":0,"722":0,"725":0,"732":0,"734":0,"735":0,"736":0,"737":0,"743":0};
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].functions = {"ScrollAnim:65":0,"setter:85":0,"(anonymous 2):107":0,"setter:103":0,"initializer:247":0,"(anonymous 3):295":0,"requestAnimationFrame:291":0,"cancelAnimationFrame:306":0,"requestAnimationFramePolyfill:279":0,"resize:316":0,"start:345":0,"animationLoop:374":0,"render:426":0,"startAnimatable:532":0,"stopAnimatable:550":0,"(anonymous 5):589":0,"(anonymous 4):579":0,"setAnimatable:576":0,"resetAnimatable:604":0,"wheelHandler:626":0,"resizeHandler:647":0,"scrollTo:655":0,"touchStartHandler:665":0,"touchMoveHandler:687":0,"getTweenedValue:717":0,"checkMaxScroll:731":0,"(anonymous 1):1":0};
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].coveredLines = 185;
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].coveredFunctions = 27;
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 1);
YUI.add('gallery-scrollanim', function (Y, NAME) {

/*
 * Copyright (c) 2013, Yahoo! Inc.  All rights reserved.
 *
 * Redistribution and use of this software in source and binary forms,
 * with or without modification, are permitted provided that the following
 * conditions are met:
 *
 * - Redistributions of source code must retain the above
 *   copyright notice, this list of conditions and the
 *   following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above
 *   copyright notice, this list of conditions and the
 *   following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 * - Neither the name of Yahoo! Inc. nor the names of its
 *   contributors may be used to endorse or promote products
 *   derived from this software without specific prior
 *   written permission of Yahoo! Inc.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*global YUI,window,TWEEN*/
/*jslint nomen: true*/

/**
 * This is a YUI module that animates HTML elements based on window.scrollTop property.
 *
 * @author Emily Yang <emyang@yahoo-inc.com>
 * @author Renato Iwashima <renatoi@yahoo-inc.com>
 *
 * @module gallery-scrollanim
 */
    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 48);
'use strict';

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 50);
var ATTRIBUTE = Y.Attribute,
        LANG = Y.Lang,
        ARRAY = Y.Array,
        NULL = null,
        TOUCH = false; //Default is a Desktop Enviroment

    /**
     * ScrollAnim provides a YUI module that can animate any HTML element based on
     * user's scroll position and supports both touch/mouse based devices.
     *
     * @class ScrolAnim
     * @param cfg {Object} Object literal with initial attribute values
     * @extends Base
     * @constructor
     */
    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 65);
function ScrollAnim(cfg) {
        // Invoke Base constructor, passing through arguments
        _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "ScrollAnim", 65);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 67);
ScrollAnim.superclass.constructor.apply(this, arguments);
        //Touch is part of the configuration (boolean)
        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 69);
if (cfg.touchEnable) {
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 70);
TOUCH = cfg.touchEnable;
        }
    }

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 74);
ScrollAnim.NAME = "scrollAnim";
    // configure the scroll anim instance
    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 76);
ScrollAnim.ATTRS = {
        /**
        * Selector for main container that will wrap the whole content
        * @attribute node
        * @type {Object}
        * @default "NULL"
        */
        node: {
            value: NULL,
            setter: function (node) {
                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setter", 85);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 86);
var n = Y.one(node);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 87);
if (!n) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 88);
Y.fail('ScrollAnim: Invalid node given: ' + node, 'error');
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 89);
return ATTRIBUTE.INVALID_VALUE;
                }
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 91);
return n;
            },
            writeOnce: "initOnly"
        },
        /**
        * Stores the animation configuration
        * @attribute animations
        * @type {Object}
        * @default "NULL"
        */
        animations: {
            value: NULL,
            setter: function (animations) {
                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setter", 103);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 104);
if (!LANG.isArray(animations)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 105);
return ATTRIBUTE.INVALID_VALUE;
                }
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 107);
ARRAY.each(animations, function (animObj) {

                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 2)", 107);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 109);
var node;

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 111);
if (!LANG.isObject(animObj)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 112);
return ATTRIBUTE.INVALID_VALUE;
                    } else {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 114);
node = Y.one(animObj.selector);
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 115);
if (!animObj.selector) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 116);
return ATTRIBUTE.INVALID_VALUE;
                        }
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 118);
animObj.node = node;
                        //animObj.offsetTop = node.get('offsetTop');
                    }
                });

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 123);
return animations;
            }
        },
        /**
        * Set the max scroll height
        * @attribute maxScroll
        * @type Int
        * @default "1000"
        */
        maxScroll: {
            value: {
                value: 1000
            }
        },
        /**
        * Set interval (ms) if not using RAF (requestAnimationFrame)
        * @attribute tickSpeed
        * @type Int
        * @default "100"
        */
        tickSpeed: {
            value: 100
        },
        /**
        * Set the speed of the scroll
        * @attribute scrollSpeed
        * @type Int
        * @default "20"
        */
        scrollSpeed: {
            value: 20
        },
        /**
        * Set if the widget needs requestAnimationFrame (RAF)
        * @attribute useRAF
        * @type Boolean
        * @default "true"
        */
        useRAF: {
            value: true
        },
        /**
        * Set scrollTop tween speed
        * @attribute tweenSpeed
        * @type Int
        * @default "0.3"
        */
        tweenSpeed: {
            value: 0.3
        },
        /**
        * Set scrollTop where the experience starts
        * @attribute startAt
        * @type Int
        * @default "0"
        */
        startAt: {
            value: 0
        },
        /**
        * Set a function fired on scroll start
        * @attribute onStart
        * @type function
        * @default "NULL"
        */
        onStart: {
            value: null
        },
        /**
        * Set a function fired on whindows resize
        * @attribute onResize
        * @type function
        * @default "NULL"
        */
        onResize: {
            value: null
        },
        /**
        * Set a function fired on scroll status update
        * @attribute onUpdate
        * @type function
        * @default "NULL"
        */
        onUpdate: {
            value: null
        }
    };

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 211);
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

        /**
        * Initialize the animation and the node specified on Attributes. This function also init some events for scroll and touch
        * @method initializer
        * @param {Object | cfg} Configuration for the widget
        */
        initializer: function (cfg) {
            // initialize
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "initializer", 247);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 249);
var node = this.get('node'),
                anims = this.get('animations');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 252);
this.settings = cfg;
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 253);
this.animation = anims;

            // requestAnimationFrame polyfill
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 256);
this.requestAnimationFramePolyfill();

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 258);
if (TOUCH) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 259);
node.on('touchstart', Y.bind(this.touchStartHandler, this));
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 260);
node.on('touchmove', Y.bind(this.touchMoveHandler, this));
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 261);
node.on('touchend', Y.bind(this.touchEndHandler, this));
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 264);
Y.on('mousewheel', Y.bind(this.wheelHandler, this));
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 265);
Y.on('resize', Y.bind(this.resizeHandler, this));

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 267);
this.resize();
        },

        /**
        * This function creates the animation work, it's used a timer loop to make changes every few milliseconds.
        * It comes from a 3er party js, modified to use YUI. Original reference:
        * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        * requestAnimationFrame polyfill by Erik Mâˆšâˆ‚ller
        * fixes from Paul Irish and Tino Zijdel
        * @method requestAnimationFramePolyfill
        */
        requestAnimationFramePolyfill: function () {

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "requestAnimationFramePolyfill", 279);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 281);
var lastTime = 0,
                vendors = ['ms', 'moz', 'webkit', 'o'],
                x;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 285);
for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 286);
window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 287);
window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 290);
if (!window.requestAnimationFrame) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 291);
window.requestAnimationFrame = function (callback) {

                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "requestAnimationFrame", 291);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 293);
var currTime = new Date().getTime(),
                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                        id = window.setTimeout(function () {
                            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 3)", 295);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 296);
callback(currTime + timeToCall);
                        }, timeToCall);

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 299);
lastTime = currTime + timeToCall;

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 301);
return id;
                };
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 305);
if (!window.cancelAnimationFrame) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 306);
window.cancelAnimationFrame = function (id) {
                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "cancelAnimationFrame", 306);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 307);
clearTimeout(id);
                };
            }
        },

        /**
        * This is the default function to handle the windows resize
        * @method resize
        */
        resize: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resize", 316);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 317);
var container = this.get('node'),
                width = parseInt(container.getComputedStyle('width'), 10),
                height = parseInt(container.getComputedStyle('height'), 10),
                onResize = this.get('onResize');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 322);
this.page = {
                wWidth: width,
                wHeight: height,
                wCenter: {
                    left: width / 2,
                    top: height / 2
                }
            };

            // onResize callback
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 332);
if (onResize && typeof onResize === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 333);
onResize(this.page);
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 336);
this.resetAnimatable();
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 337);
this.setAnimatable();
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 338);
this.start();
        },

        /**
        * This is the default function to start the animation
        * @method start
        */
        start: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "start", 345);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 346);
var startAt = Y.Lang.isFunction(this.get('startAt')) ? this.get('startAt')() : this.get('startAt'),
                onStart = this.get('onStart');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 349);
if (!this.started && startAt) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 350);
this.scrollTopTweened = this.scrollTop = startAt;
            }

            // trigger first anim
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 354);
this.scrollTop += 1;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 356);
if (!this.started) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 357);
this.animationLoop();
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 358);
this.started = true;
            }

            // remove so 1px of scroll otherwise it will keep scrolling onresize
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 362);
this.scrollTop -= 1;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 364);
if (onStart && typeof onStart === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 365);
onStart();
            }
        },

        /**
        * This function determinates the direction and the animation time frame to make a smooth action.
        * It also check if the animation is in range.
        * @method animationLoop
        */
        animationLoop: function () {

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "animationLoop", 374);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 376);
window.requestAnimationFrame(Y.bind(this.animationLoop, this));

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 378);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 379);
return;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 382);
var tweenSpeed = this.get('tweenSpeed'),
                animation = this.animation,
                anim,
                i,
                onUpdate = this.get('onUpdate'),
                startAt,
                endAt;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 390);
if (Math.ceil(this.scrollTopTweened) !== Math.floor(this.scrollTop)) {
                //Smooth out scrolling action
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 392);
this.scrollTopTweened += tweenSpeed * (this.scrollTop - this.scrollTopTweened);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 393);
this.scrollTopTweened = Math.round(this.scrollTopTweened * 100) / 100;

                //Direction
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 396);
this.scrollDirection = this.scrollTop > this.scrollTopTweened ? 1 : -1;

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 398);
for (i in animation) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 399);
if (animation.hasOwnProperty(i)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 400);
anim = animation[i];

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 402);
startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt;
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 403);
endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

                        // check if animation is in range
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 406);
if (this.scrollTopTweened >= startAt && this.scrollTopTweened <= endAt) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 407);
this.startAnimatable(anim);
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 408);
this.render(anim);
                        } else {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 410);
this.stopAnimatable(anim);
                        }
                    }
                }

                // onAnimate callback
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 416);
if (onUpdate && typeof onUpdate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 417);
onUpdate(this.scrollTopTweened);
                }

            }
        },

        /**
        * @method render
        */
        render: function (anim) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "render", 426);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 427);
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
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 443);
progress = Math.max(0, Math.min(1, progress));
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 444);
anim.lastProgress = progress;

            //Check and run keyframes within scroll range
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 447);
if (anim.keyframes) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 448);
for (i = 1; i < anim.keyframes.length; i += 1) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 449);
keyframe = anim.keyframes[i];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 450);
lastkeyframe = anim.keyframes[i - 1];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 451);
keyframeProgress = (lastkeyframe.position - progress) / (lastkeyframe.position - keyframe.position);

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 453);
if (keyframeProgress >= 0 && keyframeProgress <= 1) {

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 455);
if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 456);
keyframe.onProgress(keyframeProgress, this.scrollDirection);
                        }

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 459);
for (property in keyframe.properties) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 460);
if (keyframe.properties.hasOwnProperty(property)) {
                                //Are we animating a background in more than X?
                                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 462);
if (property === "background-position" && keyframe.properties[property].hasOwnProperty("x")) {
                                    //Process the object
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 464);
startValues = Y.clone(keyframe.properties[property]);
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 465);
endValues = Y.clone(lastkeyframe.properties[property]);
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 466);
result = "";

                                    // normalize it
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 469);
if (Y.Lang.isFunction(startValues.x)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 470);
startValues.x = startValues.x();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 472);
if (Y.Lang.isFunction(startValues.y)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 473);
startValues.y = startValues.y();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 475);
if (Y.Lang.isFunction(endValues.x)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 476);
endValues.x = endValues.x();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 478);
if (Y.Lang.isFunction(endValues.y)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 479);
endValues.y = endValues.y();
                                    }

                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 482);
if (typeof startValues.x === "number") {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 483);
result += this.getTweenedValue(endValues.x, startValues.x, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 485);
result += startValues.x;
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 487);
result += " ";
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 488);
if (typeof startValues.y === "number") {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 489);
result += this.getTweenedValue(endValues.y, startValues.y, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 491);
result += startValues.y;
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 493);
properties.backgroundPosition = result;
                                } else {
                                    //Just tween the value otherwise
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 496);
if (Y.Lang.isFunction(keyframe.properties[property])) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 497);
propertyVal = keyframe.properties[property]();
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 499);
propertyVal = keyframe.properties[property];
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 501);
if (Y.Lang.isFunction(lastkeyframe.properties[property])) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 502);
lastPropertyVal = lastkeyframe.properties[property]();
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 504);
lastPropertyVal = lastkeyframe.properties[property];
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 506);
properties[property] = this.getTweenedValue(lastPropertyVal, propertyVal, keyframeProgress, 1, keyframe.ease);
                                }
                            }
                        }
                    }
                }
            }

            // Apply all tweened css styles
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 515);
anim.node.setStyles(properties);

            // onProgress callback (not really used)
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 518);
if (anim.onProgress && typeof anim.onProgress === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 519);
anim.onProgress(anim, progress);
            }
        },

        destructor: function () {
            // destroy
        },

        /**
        * This function runs before animation starts when animation is in range
        * @method startAnimatable
        * @param {Object | anim} animation instance
        */
        startAnimatable: function (anim) {
            // apply start properties
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "startAnimatable", 532);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 534);
if (!anim._started) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 535);
if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 536);
anim.onStartAnimate(anim, this.scrollDirection);
                } else {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 538);
anim.node.setStyle('display', 'block');
                }

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 541);
anim._started = true;
            }
        },

        /**
        * This function runs after animation is out of range
        * @method stopAnimatable
        * @param {Object | anim} animation instance
        */
        stopAnimatable: function (anim) {

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "stopAnimatable", 550);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 552);
var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,
                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

            // Apply end properties after items move out of range if they were running
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 556);
if (((anim._started && endAt < this.scrollTopTweened) || (anim._started && startAt > this.scrollTopTweened)) ||
                    (this.scrollDirection < 0 && anim.lastProgress > 0 && startAt > this.scrollTopTweened) ||
                    (this.scrollDirection > 0 && anim.lastProgress < 1 && endAt < this.scrollTopTweened)) {

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 560);
this.render(anim);

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 562);
if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 563);
anim.onEndAnimate(anim, this.scrollDirection);
                }/* else {
                    anim.node.setStyle('display', 'none');
                }*/
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 567);
anim._started = false;
            }
        },

        /**
        * Calls onInit() callbacks passed to the animation object and to each key frame
        * This function is called on init and on resize
        * @method setAnimatable
        */
        setAnimatable: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setAnimatable", 576);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 577);
var animations = this.get('animations');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 579);
Y.Object.each(animations, function (animation) {

                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 4)", 579);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 581);
animation.lastProgress = 0;

                // onInit callback for each animation object
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 584);
if (LANG.isFunction(animation.onInit)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 585);
animation.onInit(animation);
                }

                // integrate through keyframes
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 589);
Y.Array.each(animation.keyframes, function (keyframe) {

                    // execute onInit callback for each keyframe
                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 5)", 589);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 592);
if (LANG.isFunction(keyframe.onInit)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 593);
keyframe.onInit(animation);
                    }

                });

            });
        },

        /**
        * @method resetAnimatable
        */
        resetAnimatable: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resetAnimatable", 604);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 605);
var animation = this.get('animation'),
                anim,
                i;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 609);
for (i in animation) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 610);
if (animation.hasOwnProperty(i)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 611);
anim = animation[i];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 612);
if (anim._started) {
                        //delete anim._elem;
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 614);
delete anim._started;
                    }
                }
            }
        },

        /***** Event handlers *****/
        /**
        * Mouse wheel event handler. This function will allow the mouse wheel interaction.
        * @method wheelHandler
        * @param {Event | e } asociated event
        */
        wheelHandler: function (e) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "wheelHandler", 626);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 627);
var scrollSpeed = this.get('scrollSpeed'),
                delta = e.wheelDelta;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 630);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 631);
return;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 634);
this.scrollTop -= delta * scrollSpeed;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 636);
if (this.scrollTop < 0) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 637);
this.scrollTop = 0;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 640);
this.checkMaxScroll();
        },

        /**
        * Windows resize event handler. This function will be fired on windows resize.
        * @method resizeHandler
        */
        resizeHandler: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resizeHandler", 647);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 648);
this.resize();
        },

        /**
        * @method scrollTo
        * @param {Object | scroll } scroll
        */
        scrollTo: function (scroll) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "scrollTo", 655);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 656);
this.scrollTop = scroll;
        },

        /**
        * On start touch event handler. This function Store the position of finger on
        * swipe begin and set the scroll val on swipe begin.
        * @method touchStartHandler
        * @param {Event | e } asociated event
        */
        touchStartHandler: function (e) {
            //alert('in touch start');
            //e.preventDefault();
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "touchStartHandler", 665);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 668);
this.touchStart.x = e.touches[0].pageX;

            // Store the position of finger on swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 671);
this.touchStart.y = e.touches[0].pageY;

            // Store scroll val on swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 674);
this.scrollStart = this.scrollTop;
        },

        touchEndHandler: function () {

        },

        /**
        * On touch move event handler. This function gets distance finger has moved since swipe begin
        * and add it to original scroll value.
        * @method touchMoveHandler
        * @param {Event | e } asociated event
        */
        touchMoveHandler: function (e) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "touchMoveHandler", 687);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 688);
e.preventDefault();
            //alert('in touch move');
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 690);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 691);
return;
            }
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 693);
var offset = {};
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 694);
offset.x = this.touchStart.x - e.touches[0].pageX;

            // Get distance finger has moved since swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 697);
offset.y = this.touchStart.y - e.touches[0].pageY;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 699);
if (Math.abs(offset.y) > Math.abs(offset.x)) {
                // Add finger move dist to original scroll value
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 701);
this.scrollTop = Math.max(0, this.scrollStart + offset.y);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 702);
this.checkMaxScroll();
            }
        },

        /***** Utils *****/
        /**
        * Get tweened value based on animation progress
        * @method getTweenedValue
        * @param {Int | start } start position
        * @param {Int | end } end position
        * @param {Int | currentTime } Time passed since the animation start
        * @param {Int | totalTime } Total estimated time
        * @param {Object | tweener } TWEEN instance
        * @return {Int} Tweened value
        */
        getTweenedValue: function (start, end, currentTime, totalTime, tweener) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "getTweenedValue", 717);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 718);
var delta = end - start,
                percentComplete = currentTime / totalTime;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 721);
if (!tweener) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 722);
tweener = TWEEN.Easing.Linear.EaseNone;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 725);
return tweener(percentComplete) * delta + start;
        },
        /**
        * Keep scroll range between 0 and maximum scroll value
        * @method checkMaxScroll
        */
        checkMaxScroll: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "checkMaxScroll", 731);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 732);
var maxScroll = this.get('maxScroll').value;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 734);
if (this.scrollTop < 0) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 735);
this.scrollTop = 0;
            } else {_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 736);
if (this.scrollTop > maxScroll) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 737);
this.scrollTop = maxScroll;
            }}
        }

    });

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 743);
Y.ScrollAnim = ScrollAnim;

}, '0.0.1', {
    "requires": [
        "base",
        "widget",
        "yui-throttle",
        "transition",
        "event-mousewheel",
        "event-resize",
        "event-touch"
    ],
    "skinnable": false
});
