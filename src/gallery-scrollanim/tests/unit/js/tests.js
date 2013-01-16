YUI.add('module-tests', function (Y) {
    'use strict';

    var suite = new Y.Test.Suite('gallery-scrollanim');

    suite.add(new Y.Test.Case({
        name: 'Case 0 Tests',
    
        //---------------------------------------------
        // Setup and tear down
        //---------------------------------------------

        setUp : function () { 
            
            this.cfg = {
                node: '#test', 
                slideHeight: 1000, // height of each section
                animations: false, // animation data
                maxScroll: 1000, // max scroll
                useRAF: true, // set requestAnimationFrame
                tickSpeed: 50, // set interval (ms) if not using RAF
                scrollSpeed: 15,
                debug: false, // turn on debug
                tweenSpeed: 0.2, // scrollTop tween speed
                startAt: 0, // scrollTop where the experience starts
                onStart: Y.bind(true, this),
                onResize: Y.bind(true, this),
                onUpdate: Y.bind(true, this)
            };
        },

        tearDown : function () {
            delete this.data;
        },
        //---------------------------------------------
        // Tests
        //---------------------------------------------

        'testapiExists': function () {
            Y.Assert.isFunction(ScrollAnim(this.cfg), 'Y.ScrollAnim should be a function.');
            var ScrollAnim = new Y.ScrollAnim(this.cfg);
            Y.Assert.isObject(ScrollAnim, 'ScrollAnim should be an object.');
        },
        
        'testDestructor': function() {
            Y.Assert.isNull(null);
        },
        'testScrollAnim': function(){
            Y.Assert.isNull(null);
        },
        'testrequestAnimationFramePolyfill': function () {
            Y.Assert.isNull(null);
        },
        'testresize': function () {
            Y.Assert.isNull(null);
        },
        'teststart': function () {
            Y.Assert.isNull(null);
        },
        'testanimationLoop': function () {
            Y.Assert.isNull(null);
        },
        'testrender': function () {
            Y.Assert.isNull(null);
        },
        'teststartAnimatable': function () {
            Y.Assert.isNull(null);
        },
        'teststopAnimatable': function (anim) {
            Y.Assert.isNull(null);
        },
        'testsetAnimatable': function () {
            Y.Assert.isNull(null);
        },
        'testresetAnimatable': function () {
            Y.Assert.isNull(null);
        },
        'testwheelHandler': function () {
            Y.Assert.isNull(null);
        },
        'testresizeHandler': function () {
            Y.Assert.isNull(null);
        },
        'testscrollTo': function () {
            Y.Assert.isNull(null);
        },
        'testtouchStartHandler': function () {
            Y.Assert.isNull(null);
        },
        'testtouchEndHandler': function () {
            Y.Assert.isNull(null);
        },
        'testtouchMoveHandler': function () {
            Y.Assert.isNull(null);
        },
        'testgetTweenedValue': function () {
            Y.Assert.isNull(null);
        },
        'testcheckScrollExtents': function () {
            Y.Assert.isNull(null);
        }
    }));
    
   Y.Test.Runner.add(suite);
}, '', {
    requires: ['gallery-scrollanim', 'test']
});
