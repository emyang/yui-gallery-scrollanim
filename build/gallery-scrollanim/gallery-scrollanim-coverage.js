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
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].code=["YUI.add('gallery-scrollanim', function (Y, NAME) {","","/*"," * Copyright (c) 2013, Yahoo! Inc.  All rights reserved."," *"," * Redistribution and use of this software in source and binary forms,"," * with or without modification, are permitted provided that the following"," * conditions are met:"," *"," * - Redistributions of source code must retain the above"," *   copyright notice, this list of conditions and the"," *   following disclaimer."," *"," * - Redistributions in binary form must reproduce the above"," *   copyright notice, this list of conditions and the"," *   following disclaimer in the documentation and/or other"," *   materials provided with the distribution."," *"," * - Neither the name of Yahoo! Inc. nor the names of its"," *   contributors may be used to endorse or promote products"," *   derived from this software without specific prior"," *   written permission of Yahoo! Inc."," *"," * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS"," * IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED"," * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A"," * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT"," * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,"," * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT"," * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,"," * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY"," * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT"," * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE"," * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE."," */","","/*global YUI,window,TWEEN*/","/*jslint nomen: true*/","/**"," * This is a widget that animates HTML elements based on window.scrollTop property."," * @author Emily Yang <emyang@yahoo-inc.com>"," * @author Renato Iwashima <renatoi@yahoo-inc.com>"," * @namespace scrollAnim"," * @class gallery-scrollanim"," */","    'use strict';","","    var ATTRIBUTE = Y.Attribute,","        LANG = Y.Lang,","        ARRAY = Y.Array,","        NULL = null,","        TOUCH = false; //Default is a Desktop Enviroment","","    function ScrollAnim(cfg) {","        // Invoke Base constructor, passing through arguments","        ScrollAnim.superclass.constructor.apply(this, arguments);","        //Touch is part of the configuration (boolean)","        if (cfg.touchEnable) {","            TOUCH = cfg.touchEnable;","        }","    }","","    ScrollAnim.NAME = \"scrollAnim\";","    // configure the scroll anim instance","    ScrollAnim.ATTRS = {","        /**","        * Selector for main container that will wrap the whole content","        * @attribute node","        * @type {Object}","        * @default \"NULL\"","        */","        node: {","            value: NULL,","            setter: function (node) {","                var n = Y.one(node);","                if (!n) {","                    Y.fail('ScrollAnim: Invalid node given: ' + node, 'error');","                    return ATTRIBUTE.INVALID_VALUE;","                }","                return n;","            },","            writeOnce: \"initOnly\"","        },","        /**","        * Stores the animation configuration","        * @attribute animations","        * @type {Object}","        * @default \"NULL\"","        */","        animations: {","            value: NULL,","            setter: function (animations) {","                if (!LANG.isArray(animations)) {","                    return ATTRIBUTE.INVALID_VALUE;","                }","                ARRAY.each(animations, function (animObj) {","","                    var node;","","                    if (!LANG.isObject(animObj)) {","                        return ATTRIBUTE.INVALID_VALUE;","                    } else {","                        node = Y.one(animObj.selector);","                        if (!animObj.selector) {","                            return ATTRIBUTE.INVALID_VALUE;","                        }","                        animObj.node = node;","                        //animObj.offsetTop = node.get('offsetTop');","                    }","                });","","                return animations;","            }","        },","        /**","        * Set the max scroll height","        * @attribute maxScroll","        * @type Int","        * @default \"1000\"","        */","        maxScroll: {","            value: {","                value: 1000","            }","        },","        /**","        * Set interval (ms) if not using RAF (requestAnimationFrame)","        * @attribute tickSpeed","        * @type Int","        * @default \"100\"","        */","        tickSpeed: {","            value: 100","        },","        /**","        * Set the speed of the scroll","        * @attribute scrollSpeed","        * @type Int","        * @default \"20\"","        */","        scrollSpeed: {","            value: 20","        },","        /**","        * Set if the widget needs requestAnimationFrame (RAF)","        * @attribute useRAF","        * @type Boolean","        * @default \"true\"","        */","        useRAF: {","            value: true","        },","        /**","        * Set scrollTop tween speed","        * @attribute tweenSpeed","        * @type Int","        * @default \"0.3\"","        */","        tweenSpeed: {","            value: 0.3","        },","        /**","        * Set scrollTop where the experience starts","        * @attribute startAt","        * @type Int","        * @default \"0\"","        */","        startAt: {","            value: 0","        },","        /**","        * Set a function fired on scroll start","        * @attribute onStart","        * @type function","        * @default \"NULL\"","        */","        onStart: {","            value: null","        },","        /**","        * Set a function fired on whindows resize","        * @attribute onResize","        * @type function","        * @default \"NULL\"","        */","        onResize: {","            value: null","        },","        /**","        * Set a function fired on scroll status update","        * @attribute onUpdate","        * @type function","        * @default \"NULL\"","        */","        onUpdate: {","            value: null","        }","    };","","    Y.extend(ScrollAnim, Y.Base, {","","        keyframe: 0,","","        settings: {},","","        page: null,","","        started: false,","","        paused: false,","","        animation: null,","","        touch: false, // is touch device","","        touchStart: {","            x: 0,","            y: 0","        }, // vars for touch","","        scrollStart: 0, // vars for scroll","","        scrollTopTweened: 0,","","        scrollTop: 0,","","        scrollDirection: 0,","","        autoScrollInterval: 0,","","        /**","        * Initialize the animation and the node specified on Attributes. This function also init some events for scroll and touch","        * @method initializer","        * @param {Object | cfg} Configuration for the widget","        */","        initializer: function (cfg) {","            // initialize","            var node = this.get('node'),","                anims = this.get('animations');","","            this.settings = cfg;","            this.animation = anims;","","            // requestAnimationFrame polyfill","            this.requestAnimationFramePolyfill();","","            if (TOUCH) {","                node.on('touchstart', Y.bind(this.touchStartHandler, this));","                node.on('touchmove', Y.bind(this.touchMoveHandler, this));","                node.on('touchend', Y.bind(this.touchEndHandler, this));","            }","","            Y.on('mousewheel', Y.bind(this.wheelHandler, this));","            Y.on('resize', Y.bind(this.resizeHandler, this));","","            this.resize();","        },","","        /**","        * This function creates the animation work, it's used a timer loop to make changes every few milliseconds.","        * It comes from a 3er party js, modified to use YUI. Original reference:","        * http://paulirish.com/2011/requestanimationframe-for-smart-animating/","        * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating","        * requestAnimationFrame polyfill by Erik Mâˆšâˆ‚ller","        * fixes from Paul Irish and Tino Zijdel","        * @method requestAnimationFramePolyfill","        */","        requestAnimationFramePolyfill: function () {","","            var lastTime = 0,","                vendors = ['ms', 'moz', 'webkit', 'o'],","                x;","","            for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {","                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];","                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];","            }","","            if (!window.requestAnimationFrame) {","                window.requestAnimationFrame = function (callback) {","","                    var currTime = new Date().getTime(),","                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),","                        id = window.setTimeout(function () {","                            callback(currTime + timeToCall);","                        }, timeToCall);","","                    lastTime = currTime + timeToCall;","","                    return id;","                };","            }","","            if (!window.cancelAnimationFrame) {","                window.cancelAnimationFrame = function (id) {","                    clearTimeout(id);","                };","            }","        },","","        /**","        * This is the default function to handle the windows resize","        * @method resize","        */","        resize: function () {","            var container = this.get('node'),","                width = parseInt(container.getComputedStyle('width'), 10),","                height = parseInt(container.getComputedStyle('height'), 10),","                onResize = this.get('onResize');","","            this.page = {","                wWidth: width,","                wHeight: height,","                wCenter: {","                    left: width / 2,","                    top: height / 2","                }","            };","","            // onResize callback","            if (onResize && typeof onResize === 'function') {","                onResize(this.page);","            }","","            this.resetAnimatable();","            this.setAnimatable();","            this.start();","        },","","        /**","        * This is the default function to start the animation","        * @method start","        */","        start: function () {","            var startAt = Y.Lang.isFunction(this.get('startAt')) ? this.get('startAt')() : this.get('startAt'),","                onStart = this.get('onStart');","","            if (!this.started && startAt) {","                this.scrollTopTweened = this.scrollTop = startAt;","            }","","            // trigger first anim","            this.scrollTop += 1;","","            if (!this.started) {","                this.animationLoop();","                this.started = true;","            }","","            // remove so 1px of scroll otherwise it will keep scrolling onresize","            this.scrollTop -= 1;","","            if (onStart && typeof onStart === 'function') {","                onStart();","            }","        },","","        /**","        * This function determinates the direction and the animation time frame to make a smooth action.","        * It also check if the animation is in range.","        * @method animationLoop","        */","        animationLoop: function () {","","            window.requestAnimationFrame(Y.bind(this.animationLoop, this));","","            if (this.paused) {","                return;","            }","","            var tweenSpeed = this.get('tweenSpeed'),","                animation = this.animation,","                anim,","                i,","                onUpdate = this.get('onUpdate'),","                startAt,","                endAt;","","            if (Math.ceil(this.scrollTopTweened) !== Math.floor(this.scrollTop)) {","                //Smooth out scrolling action","                this.scrollTopTweened += tweenSpeed * (this.scrollTop - this.scrollTopTweened);","                this.scrollTopTweened = Math.round(this.scrollTopTweened * 100) / 100;","","                //Direction","                this.scrollDirection = this.scrollTop > this.scrollTopTweened ? 1 : -1;","","                for (i in animation) {","                    if (animation.hasOwnProperty(i)) {","                        anim = animation[i];","","                        startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt;","                        endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;","","                        // check if animation is in range","                        if (this.scrollTopTweened >= startAt && this.scrollTopTweened <= endAt) {","                            this.startAnimatable(anim);","                            this.render(anim);","                        } else {","                            this.stopAnimatable(anim);","                        }","                    }","                }","","                // onAnimate callback","                if (onUpdate && typeof onUpdate === 'function') {","                    onUpdate(this.scrollTopTweened);","                }","","            }","        },","","        /**","        * @method render","        */","        render: function (anim) {","            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,","                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt,","                progress = (startAt - this.scrollTopTweened) / (startAt - endAt), //Calculate animation progress %","                properties = {}, //Create new CSS properties map","                i,","                keyframe, //Current animation keyframe","                lastkeyframe, //Last animation keyframe","                keyframeProgress, //Keyframe progress %","                property, //Single CSS property","                startValues, //Start values of CSS property","                endValues, //End values of CSS property","                result, //For background-position CSS property value","                propertyVal, //Property value if property is a function","                lastPropertyVal; //Property value if property is a function","","            //Clamp progress between 0 and 100 percent (render is always called 1 lst time at the end to clean up)","            progress = Math.max(0, Math.min(1, progress));","            anim.lastProgress = progress;","","            //Check and run keyframes within scroll range","            if (anim.keyframes) {","                for (i = 1; i < anim.keyframes.length; i += 1) {","                    keyframe = anim.keyframes[i];","                    lastkeyframe = anim.keyframes[i - 1];","                    keyframeProgress = (lastkeyframe.position - progress) / (lastkeyframe.position - keyframe.position);","","                    if (keyframeProgress >= 0 && keyframeProgress <= 1) {","","                        if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {","                            keyframe.onProgress(keyframeProgress, this.scrollDirection);","                        }","","                        for (property in keyframe.properties) {","                            if (keyframe.properties.hasOwnProperty(property)) {","                                //Are we animating a background in more than X?","                                if (property === \"background-position\" && keyframe.properties[property].hasOwnProperty(\"x\")) {","                                    //Process the object","                                    startValues = Y.clone(keyframe.properties[property]);","                                    endValues = Y.clone(lastkeyframe.properties[property]);","                                    result = \"\";","","                                    // normalize it","                                    if (Y.Lang.isFunction(startValues.x)) {","                                        startValues.x = startValues.x();","                                    }","                                    if (Y.Lang.isFunction(startValues.y)) {","                                        startValues.y = startValues.y();","                                    }","                                    if (Y.Lang.isFunction(endValues.x)) {","                                        endValues.x = endValues.x();","                                    }","                                    if (Y.Lang.isFunction(endValues.y)) {","                                        endValues.y = endValues.y();","                                    }","","                                    if (typeof startValues.x === \"number\") {","                                        result += this.getTweenedValue(endValues.x, startValues.x, keyframeProgress, 1, keyframe.ease) + \"px\";","                                    } else {","                                        result += startValues.x;","                                    }","                                    result += \" \";","                                    if (typeof startValues.y === \"number\") {","                                        result += this.getTweenedValue(endValues.y, startValues.y, keyframeProgress, 1, keyframe.ease) + \"px\";","                                    } else {","                                        result += startValues.y;","                                    }","                                    properties.backgroundPosition = result;","                                } else {","                                    //Just tween the value otherwise","                                    if (Y.Lang.isFunction(keyframe.properties[property])) {","                                        propertyVal = keyframe.properties[property]();","                                    } else {","                                        propertyVal = keyframe.properties[property];","                                    }","                                    if (Y.Lang.isFunction(lastkeyframe.properties[property])) {","                                        lastPropertyVal = lastkeyframe.properties[property]();","                                    } else {","                                        lastPropertyVal = lastkeyframe.properties[property];","                                    }","                                    properties[property] = this.getTweenedValue(lastPropertyVal, propertyVal, keyframeProgress, 1, keyframe.ease);","                                }","                            }","                        }","                    }","                }","            }","","            // Apply all tweened css styles","            anim.node.setStyles(properties);","","            // onProgress callback (not really used)","            if (anim.onProgress && typeof anim.onProgress === 'function') {","                anim.onProgress(anim, progress);","            }","        },","","        destructor: function () {","            // destroy","        },","","        /**","        * This function runs before animation starts when animation is in range","        * @method startAnimatable","        * @param {Object | anim} animation instance","        */","        startAnimatable: function (anim) {","            // apply start properties","            if (!anim._started) {","                if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {","                    anim.onStartAnimate(anim, this.scrollDirection);","                } else {","                    anim.node.setStyle('display', 'block');","                }","","                anim._started = true;","            }","        },","","        /**","        * This function runs after animation is out of range","        * @method stopAnimatable","        * @param {Object | anim} animation instance","        */","        stopAnimatable: function (anim) {","","            var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,","                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;","","            // Apply end properties after items move out of range if they were running","            if (((anim._started && endAt < this.scrollTopTweened) || (anim._started && startAt > this.scrollTopTweened)) ||","                    (this.scrollDirection < 0 && anim.lastProgress > 0 && startAt > this.scrollTopTweened) ||","                    (this.scrollDirection > 0 && anim.lastProgress < 1 && endAt < this.scrollTopTweened)) {","","                this.render(anim);","","                if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {","                    anim.onEndAnimate(anim, this.scrollDirection);","                }/* else {","                    anim.node.setStyle('display', 'none');","                }*/","                anim._started = false;","            }","        },","","        /**","        * Calls onInit() callbacks passed to the animation object and to each key frame","        * This function is called on init and on resize","        * @method setAnimatable","        */","        setAnimatable: function () {","            var animations = this.get('animations');","","            Y.Object.each(animations, function (animation) {","","                animation.lastProgress = 0;","","                // onInit callback for each animation object","                if (LANG.isFunction(animation.onInit)) {","                    animation.onInit(animation);","                }","","                // integrate through keyframes","                Y.Array.each(animation.keyframes, function (keyframe) {","","                    // execute onInit callback for each keyframe","                    if (LANG.isFunction(keyframe.onInit)) {","                        keyframe.onInit(animation);","                    }","","                });","","            });","        },","","        /**","        * @method resetAnimatable","        */","        resetAnimatable: function () {","            var animation = this.get('animation'),","                anim,","                i;","","            for (i in animation) {","                if (animation.hasOwnProperty(i)) {","                    anim = animation[i];","                    if (anim._started) {","                        //delete anim._elem;","                        delete anim._started;","                    }","                }","            }","        },","","        /***** Event handlers *****/","        /**","        * Mouse wheel event handler. This function will allow the mouse wheel interaction.","        * @method wheelHandler","        * @param {Event | e } asociated event","        */","        wheelHandler: function (e) {","            var scrollSpeed = this.get('scrollSpeed'),","                delta = e.wheelDelta;","","            if (this.paused) {","                return;","            }","","            this.scrollTop -= delta * scrollSpeed;","","            if (this.scrollTop < 0) {","                this.scrollTop = 0;","            }","","            this.checkMaxScroll();","        },","","        /**","        * Windows resize event handler. This function will be fired on windows resize.","        * @method resizeHandler","        */","        resizeHandler: function () {","            this.resize();","        },","","        /**","        * @method scrollTo","        * @param {Object | scroll } scroll","        */","        scrollTo: function (scroll) {","            this.scrollTop = scroll;","        },","","        /**","        * On start touch event handler. This function Store the position of finger on","        * swipe begin and set the scroll val on swipe begin.","        * @method touchStartHandler","        * @param {Event | e } asociated event","        */","        touchStartHandler: function (e) {","            //alert('in touch start');","            //e.preventDefault();","            this.touchStart.x = e.touches[0].pageX;","","            // Store the position of finger on swipe begin:","            this.touchStart.y = e.touches[0].pageY;","","            // Store scroll val on swipe begin:","            this.scrollStart = this.scrollTop;","        },","","        touchEndHandler: function () {","","        },","","        /**","        * On touch move event handler. This function gets distance finger has moved since swipe begin","        * and add it to original scroll value.","        * @method touchMoveHandler","        * @param {Event | e } asociated event","        */","        touchMoveHandler: function (e) {","            e.preventDefault();","            //alert('in touch move');","            if (this.paused) {","                return;","            }","            var offset = {};","            offset.x = this.touchStart.x - e.touches[0].pageX;","","            // Get distance finger has moved since swipe begin:","            offset.y = this.touchStart.y - e.touches[0].pageY;","","            if (Math.abs(offset.y) > Math.abs(offset.x)) {","                // Add finger move dist to original scroll value","                this.scrollTop = Math.max(0, this.scrollStart + offset.y);","                this.checkMaxScroll();","            }","        },","","        /***** Utils *****/","        /**","        * Get tweened value based on animation progress","        * @method getTweenedValue","        * @param {Int | start } start position","        * @param {Int | end } end position","        * @param {Int | currentTime } Time passed since the animation start","        * @param {Int | totalTime } Total estimated time","        * @param {Object | tweener } TWEEN instance","        * @return {Int} Tweened value","        */","        getTweenedValue: function (start, end, currentTime, totalTime, tweener) {","            var delta = end - start,","                percentComplete = currentTime / totalTime;","","            if (!tweener) {","                tweener = TWEEN.Easing.Linear.EaseNone;","            }","","            return tweener(percentComplete) * delta + start;","        },","        /**","        * Keep scroll range between 0 and maximum scroll value","        * @method checkMaxScroll","        */","        checkMaxScroll: function () {","            var maxScroll = this.get('maxScroll').value;","","            if (this.scrollTop < 0) {","                this.scrollTop = 0;","            } else if (this.scrollTop > maxScroll) {","                this.scrollTop = maxScroll;","            }","        }","","    });","","    Y.ScrollAnim = ScrollAnim;","","}, '0.0.1', {","    \"requires\": [","        \"base\",","        \"widget\",","        \"yui-throttle\",","        \"transition\",","        \"event-mousewheel\",","        \"event-resize\",","        \"event-touch\"","    ],","    \"skinnable\": false","});"];
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].lines = {"1":0,"46":0,"48":0,"54":0,"56":0,"58":0,"59":0,"63":0,"65":0,"75":0,"76":0,"77":0,"78":0,"80":0,"93":0,"94":0,"96":0,"98":0,"100":0,"101":0,"103":0,"104":0,"105":0,"107":0,"112":0,"200":0,"238":0,"241":0,"242":0,"245":0,"247":0,"248":0,"249":0,"250":0,"253":0,"254":0,"256":0,"270":0,"274":0,"275":0,"276":0,"279":0,"280":0,"282":0,"285":0,"288":0,"290":0,"294":0,"295":0,"296":0,"306":0,"311":0,"321":0,"322":0,"325":0,"326":0,"327":0,"335":0,"338":0,"339":0,"343":0,"345":0,"346":0,"347":0,"351":0,"353":0,"354":0,"365":0,"367":0,"368":0,"371":0,"379":0,"381":0,"382":0,"385":0,"387":0,"388":0,"389":0,"391":0,"392":0,"395":0,"396":0,"397":0,"399":0,"405":0,"406":0,"416":0,"432":0,"433":0,"436":0,"437":0,"438":0,"439":0,"440":0,"442":0,"444":0,"445":0,"448":0,"449":0,"451":0,"453":0,"454":0,"455":0,"458":0,"459":0,"461":0,"462":0,"464":0,"465":0,"467":0,"468":0,"471":0,"472":0,"474":0,"476":0,"477":0,"478":0,"480":0,"482":0,"485":0,"486":0,"488":0,"490":0,"491":0,"493":0,"495":0,"504":0,"507":0,"508":0,"523":0,"524":0,"525":0,"527":0,"530":0,"541":0,"545":0,"549":0,"551":0,"552":0,"556":0,"566":0,"568":0,"570":0,"573":0,"574":0,"578":0,"581":0,"582":0,"594":0,"598":0,"599":0,"600":0,"601":0,"603":0,"616":0,"619":0,"620":0,"623":0,"625":0,"626":0,"629":0,"637":0,"645":0,"657":0,"660":0,"663":0,"677":0,"679":0,"680":0,"682":0,"683":0,"686":0,"688":0,"690":0,"691":0,"707":0,"710":0,"711":0,"714":0,"721":0,"723":0,"724":0,"725":0,"726":0,"732":0};
_yuitest_coverage["build/gallery-scrollanim/gallery-scrollanim.js"].functions = {"ScrollAnim:54":0,"setter:74":0,"(anonymous 2):96":0,"setter:92":0,"initializer:236":0,"(anonymous 3):284":0,"requestAnimationFrame:280":0,"cancelAnimationFrame:295":0,"requestAnimationFramePolyfill:268":0,"resize:305":0,"start:334":0,"animationLoop:363":0,"render:415":0,"startAnimatable:521":0,"stopAnimatable:539":0,"(anonymous 5):578":0,"(anonymous 4):568":0,"setAnimatable:565":0,"resetAnimatable:593":0,"wheelHandler:615":0,"resizeHandler:636":0,"scrollTo:644":0,"touchStartHandler:654":0,"touchMoveHandler:676":0,"getTweenedValue:706":0,"checkMaxScroll:720":0,"(anonymous 1):1":0};
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
 * This is a widget that animates HTML elements based on window.scrollTop property.
 * @author Emily Yang <emyang@yahoo-inc.com>
 * @author Renato Iwashima <renatoi@yahoo-inc.com>
 * @namespace scrollAnim
 * @class gallery-scrollanim
 */
    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 1)", 1);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 46);
'use strict';

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 48);
var ATTRIBUTE = Y.Attribute,
        LANG = Y.Lang,
        ARRAY = Y.Array,
        NULL = null,
        TOUCH = false; //Default is a Desktop Enviroment

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 54);
function ScrollAnim(cfg) {
        // Invoke Base constructor, passing through arguments
        _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "ScrollAnim", 54);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 56);
ScrollAnim.superclass.constructor.apply(this, arguments);
        //Touch is part of the configuration (boolean)
        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 58);
if (cfg.touchEnable) {
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 59);
TOUCH = cfg.touchEnable;
        }
    }

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 63);
ScrollAnim.NAME = "scrollAnim";
    // configure the scroll anim instance
    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 65);
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
                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setter", 74);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 75);
var n = Y.one(node);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 76);
if (!n) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 77);
Y.fail('ScrollAnim: Invalid node given: ' + node, 'error');
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 78);
return ATTRIBUTE.INVALID_VALUE;
                }
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 80);
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
                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setter", 92);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 93);
if (!LANG.isArray(animations)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 94);
return ATTRIBUTE.INVALID_VALUE;
                }
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 96);
ARRAY.each(animations, function (animObj) {

                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 2)", 96);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 98);
var node;

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 100);
if (!LANG.isObject(animObj)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 101);
return ATTRIBUTE.INVALID_VALUE;
                    } else {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 103);
node = Y.one(animObj.selector);
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 104);
if (!animObj.selector) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 105);
return ATTRIBUTE.INVALID_VALUE;
                        }
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 107);
animObj.node = node;
                        //animObj.offsetTop = node.get('offsetTop');
                    }
                });

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 112);
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

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 200);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "initializer", 236);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 238);
var node = this.get('node'),
                anims = this.get('animations');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 241);
this.settings = cfg;
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 242);
this.animation = anims;

            // requestAnimationFrame polyfill
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 245);
this.requestAnimationFramePolyfill();

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 247);
if (TOUCH) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 248);
node.on('touchstart', Y.bind(this.touchStartHandler, this));
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 249);
node.on('touchmove', Y.bind(this.touchMoveHandler, this));
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 250);
node.on('touchend', Y.bind(this.touchEndHandler, this));
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 253);
Y.on('mousewheel', Y.bind(this.wheelHandler, this));
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 254);
Y.on('resize', Y.bind(this.resizeHandler, this));

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 256);
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

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "requestAnimationFramePolyfill", 268);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 270);
var lastTime = 0,
                vendors = ['ms', 'moz', 'webkit', 'o'],
                x;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 274);
for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 275);
window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 276);
window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 279);
if (!window.requestAnimationFrame) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 280);
window.requestAnimationFrame = function (callback) {

                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "requestAnimationFrame", 280);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 282);
var currTime = new Date().getTime(),
                        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                        id = window.setTimeout(function () {
                            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 3)", 284);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 285);
callback(currTime + timeToCall);
                        }, timeToCall);

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 288);
lastTime = currTime + timeToCall;

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 290);
return id;
                };
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 294);
if (!window.cancelAnimationFrame) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 295);
window.cancelAnimationFrame = function (id) {
                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "cancelAnimationFrame", 295);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 296);
clearTimeout(id);
                };
            }
        },

        /**
        * This is the default function to handle the windows resize
        * @method resize
        */
        resize: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resize", 305);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 306);
var container = this.get('node'),
                width = parseInt(container.getComputedStyle('width'), 10),
                height = parseInt(container.getComputedStyle('height'), 10),
                onResize = this.get('onResize');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 311);
this.page = {
                wWidth: width,
                wHeight: height,
                wCenter: {
                    left: width / 2,
                    top: height / 2
                }
            };

            // onResize callback
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 321);
if (onResize && typeof onResize === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 322);
onResize(this.page);
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 325);
this.resetAnimatable();
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 326);
this.setAnimatable();
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 327);
this.start();
        },

        /**
        * This is the default function to start the animation
        * @method start
        */
        start: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "start", 334);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 335);
var startAt = Y.Lang.isFunction(this.get('startAt')) ? this.get('startAt')() : this.get('startAt'),
                onStart = this.get('onStart');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 338);
if (!this.started && startAt) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 339);
this.scrollTopTweened = this.scrollTop = startAt;
            }

            // trigger first anim
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 343);
this.scrollTop += 1;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 345);
if (!this.started) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 346);
this.animationLoop();
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 347);
this.started = true;
            }

            // remove so 1px of scroll otherwise it will keep scrolling onresize
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 351);
this.scrollTop -= 1;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 353);
if (onStart && typeof onStart === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 354);
onStart();
            }
        },

        /**
        * This function determinates the direction and the animation time frame to make a smooth action.
        * It also check if the animation is in range.
        * @method animationLoop
        */
        animationLoop: function () {

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "animationLoop", 363);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 365);
window.requestAnimationFrame(Y.bind(this.animationLoop, this));

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 367);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 368);
return;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 371);
var tweenSpeed = this.get('tweenSpeed'),
                animation = this.animation,
                anim,
                i,
                onUpdate = this.get('onUpdate'),
                startAt,
                endAt;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 379);
if (Math.ceil(this.scrollTopTweened) !== Math.floor(this.scrollTop)) {
                //Smooth out scrolling action
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 381);
this.scrollTopTweened += tweenSpeed * (this.scrollTop - this.scrollTopTweened);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 382);
this.scrollTopTweened = Math.round(this.scrollTopTweened * 100) / 100;

                //Direction
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 385);
this.scrollDirection = this.scrollTop > this.scrollTopTweened ? 1 : -1;

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 387);
for (i in animation) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 388);
if (animation.hasOwnProperty(i)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 389);
anim = animation[i];

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 391);
startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt;
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 392);
endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

                        // check if animation is in range
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 395);
if (this.scrollTopTweened >= startAt && this.scrollTopTweened <= endAt) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 396);
this.startAnimatable(anim);
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 397);
this.render(anim);
                        } else {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 399);
this.stopAnimatable(anim);
                        }
                    }
                }

                // onAnimate callback
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 405);
if (onUpdate && typeof onUpdate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 406);
onUpdate(this.scrollTopTweened);
                }

            }
        },

        /**
        * @method render
        */
        render: function (anim) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "render", 415);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 416);
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
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 432);
progress = Math.max(0, Math.min(1, progress));
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 433);
anim.lastProgress = progress;

            //Check and run keyframes within scroll range
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 436);
if (anim.keyframes) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 437);
for (i = 1; i < anim.keyframes.length; i += 1) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 438);
keyframe = anim.keyframes[i];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 439);
lastkeyframe = anim.keyframes[i - 1];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 440);
keyframeProgress = (lastkeyframe.position - progress) / (lastkeyframe.position - keyframe.position);

                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 442);
if (keyframeProgress >= 0 && keyframeProgress <= 1) {

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 444);
if (keyframe.onProgress && typeof keyframe.onProgress === 'function') {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 445);
keyframe.onProgress(keyframeProgress, this.scrollDirection);
                        }

                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 448);
for (property in keyframe.properties) {
                            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 449);
if (keyframe.properties.hasOwnProperty(property)) {
                                //Are we animating a background in more than X?
                                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 451);
if (property === "background-position" && keyframe.properties[property].hasOwnProperty("x")) {
                                    //Process the object
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 453);
startValues = Y.clone(keyframe.properties[property]);
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 454);
endValues = Y.clone(lastkeyframe.properties[property]);
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 455);
result = "";

                                    // normalize it
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 458);
if (Y.Lang.isFunction(startValues.x)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 459);
startValues.x = startValues.x();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 461);
if (Y.Lang.isFunction(startValues.y)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 462);
startValues.y = startValues.y();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 464);
if (Y.Lang.isFunction(endValues.x)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 465);
endValues.x = endValues.x();
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 467);
if (Y.Lang.isFunction(endValues.y)) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 468);
endValues.y = endValues.y();
                                    }

                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 471);
if (typeof startValues.x === "number") {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 472);
result += this.getTweenedValue(endValues.x, startValues.x, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 474);
result += startValues.x;
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 476);
result += " ";
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 477);
if (typeof startValues.y === "number") {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 478);
result += this.getTweenedValue(endValues.y, startValues.y, keyframeProgress, 1, keyframe.ease) + "px";
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 480);
result += startValues.y;
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 482);
properties.backgroundPosition = result;
                                } else {
                                    //Just tween the value otherwise
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 485);
if (Y.Lang.isFunction(keyframe.properties[property])) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 486);
propertyVal = keyframe.properties[property]();
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 488);
propertyVal = keyframe.properties[property];
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 490);
if (Y.Lang.isFunction(lastkeyframe.properties[property])) {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 491);
lastPropertyVal = lastkeyframe.properties[property]();
                                    } else {
                                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 493);
lastPropertyVal = lastkeyframe.properties[property];
                                    }
                                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 495);
properties[property] = this.getTweenedValue(lastPropertyVal, propertyVal, keyframeProgress, 1, keyframe.ease);
                                }
                            }
                        }
                    }
                }
            }

            // Apply all tweened css styles
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 504);
anim.node.setStyles(properties);

            // onProgress callback (not really used)
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 507);
if (anim.onProgress && typeof anim.onProgress === 'function') {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 508);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "startAnimatable", 521);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 523);
if (!anim._started) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 524);
if (anim.onStartAnimate && typeof anim.onStartAnimate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 525);
anim.onStartAnimate(anim, this.scrollDirection);
                } else {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 527);
anim.node.setStyle('display', 'block');
                }

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 530);
anim._started = true;
            }
        },

        /**
        * This function runs after animation is out of range
        * @method stopAnimatable
        * @param {Object | anim} animation instance
        */
        stopAnimatable: function (anim) {

            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "stopAnimatable", 539);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 541);
var startAt = Y.Lang.isFunction(anim.startAt) ? anim.startAt() : anim.startAt,
                endAt = Y.Lang.isFunction(anim.endAt) ? anim.endAt() : anim.endAt;

            // Apply end properties after items move out of range if they were running
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 545);
if (((anim._started && endAt < this.scrollTopTweened) || (anim._started && startAt > this.scrollTopTweened)) ||
                    (this.scrollDirection < 0 && anim.lastProgress > 0 && startAt > this.scrollTopTweened) ||
                    (this.scrollDirection > 0 && anim.lastProgress < 1 && endAt < this.scrollTopTweened)) {

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 549);
this.render(anim);

                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 551);
if (anim.onEndAnimate && typeof anim.onEndAnimate === 'function') {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 552);
anim.onEndAnimate(anim, this.scrollDirection);
                }/* else {
                    anim.node.setStyle('display', 'none');
                }*/
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 556);
anim._started = false;
            }
        },

        /**
        * Calls onInit() callbacks passed to the animation object and to each key frame
        * This function is called on init and on resize
        * @method setAnimatable
        */
        setAnimatable: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "setAnimatable", 565);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 566);
var animations = this.get('animations');

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 568);
Y.Object.each(animations, function (animation) {

                _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 4)", 568);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 570);
animation.lastProgress = 0;

                // onInit callback for each animation object
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 573);
if (LANG.isFunction(animation.onInit)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 574);
animation.onInit(animation);
                }

                // integrate through keyframes
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 578);
Y.Array.each(animation.keyframes, function (keyframe) {

                    // execute onInit callback for each keyframe
                    _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "(anonymous 5)", 578);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 581);
if (LANG.isFunction(keyframe.onInit)) {
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 582);
keyframe.onInit(animation);
                    }

                });

            });
        },

        /**
        * @method resetAnimatable
        */
        resetAnimatable: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resetAnimatable", 593);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 594);
var animation = this.get('animation'),
                anim,
                i;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 598);
for (i in animation) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 599);
if (animation.hasOwnProperty(i)) {
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 600);
anim = animation[i];
                    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 601);
if (anim._started) {
                        //delete anim._elem;
                        _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 603);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "wheelHandler", 615);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 616);
var scrollSpeed = this.get('scrollSpeed'),
                delta = e.wheelDelta;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 619);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 620);
return;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 623);
this.scrollTop -= delta * scrollSpeed;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 625);
if (this.scrollTop < 0) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 626);
this.scrollTop = 0;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 629);
this.checkMaxScroll();
        },

        /**
        * Windows resize event handler. This function will be fired on windows resize.
        * @method resizeHandler
        */
        resizeHandler: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "resizeHandler", 636);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 637);
this.resize();
        },

        /**
        * @method scrollTo
        * @param {Object | scroll } scroll
        */
        scrollTo: function (scroll) {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "scrollTo", 644);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 645);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "touchStartHandler", 654);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 657);
this.touchStart.x = e.touches[0].pageX;

            // Store the position of finger on swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 660);
this.touchStart.y = e.touches[0].pageY;

            // Store scroll val on swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 663);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "touchMoveHandler", 676);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 677);
e.preventDefault();
            //alert('in touch move');
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 679);
if (this.paused) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 680);
return;
            }
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 682);
var offset = {};
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 683);
offset.x = this.touchStart.x - e.touches[0].pageX;

            // Get distance finger has moved since swipe begin:
            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 686);
offset.y = this.touchStart.y - e.touches[0].pageY;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 688);
if (Math.abs(offset.y) > Math.abs(offset.x)) {
                // Add finger move dist to original scroll value
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 690);
this.scrollTop = Math.max(0, this.scrollStart + offset.y);
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 691);
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
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "getTweenedValue", 706);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 707);
var delta = end - start,
                percentComplete = currentTime / totalTime;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 710);
if (!tweener) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 711);
tweener = TWEEN.Easing.Linear.EaseNone;
            }

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 714);
return tweener(percentComplete) * delta + start;
        },
        /**
        * Keep scroll range between 0 and maximum scroll value
        * @method checkMaxScroll
        */
        checkMaxScroll: function () {
            _yuitest_coverfunc("build/gallery-scrollanim/gallery-scrollanim.js", "checkMaxScroll", 720);
_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 721);
var maxScroll = this.get('maxScroll').value;

            _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 723);
if (this.scrollTop < 0) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 724);
this.scrollTop = 0;
            } else {_yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 725);
if (this.scrollTop > maxScroll) {
                _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 726);
this.scrollTop = maxScroll;
            }}
        }

    });

    _yuitest_coverline("build/gallery-scrollanim/gallery-scrollanim.js", 732);
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
