describe('PointerMovementsService', function () {
    beforeEach(module('tutScroller'));

    beforeEach( function () {
        var _this = this;

        this.$window = {
            requestAnimationFrame: sinon.spy()
        };

        this.$document = [{}];

        this.thenable = { then: sinon.stub() };
        this.$timeout = sinon.stub().returns(this.thenable);
        this.$timeout.cancel = sinon.spy();

        module( function($provide) {
            $provide.value('$window', _this.$window);
            $provide.value('$document', _this.$document);
            $provide.value('$timeout', _this.$timeout);
        });
    });

    beforeEach( function () {
        var _this = this;

        this.ev = {
            which: 1,
            preventDefault: sinon.spy(),
            stopPropagation:sinon.spy()
        };

        this.ev.$reset = function () {
            this.preventDefault.reset();
            this.stopPropagation.reset();
        }

        inject( function ($injector) {
            _this.PM = $injector.get('PointerMovements');
        });
    });

    it('should exist', function () {
        expect(this.PM).to.exist;
    });



    // FIXME: test suite smells!
    describe('.attachTo(target)', function () {
        beforeEach( function () {
            var target = this.target = {
                on: sinon.spy()
            };

            ['mousedown', 'mousemove', 'mouseup', 'mouseleave',
                'touchstart', 'touchmove', 'touchend',
                'wheel', 'mousewheel', 'MozMousePixelScroll',
                'onmousewheel'].forEach( function (en) {
                    target.on.withArgs(en);
                });

            this.options = {the: 'options'};

            this.service = {
                tap:    sinon.spy(),
                move:   sinon.spy(),
                release:sinon.spy(),
                wheel:  sinon.spy()
            };

            this.PM.Movements = sinon.stub().returns(this.service);

            this.ev = {an: 'event'};
        });

        it('should be a static method', function () {
            expect(this.PM).itself.to.respondTo('attachTo');
        });

        it('should instantiate the service and return it', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.PM.Movements).calledOnce
                .and.calledWithExactly(this.options);

            expect(service).to.equal(this.service);
        });

        it('should bind service.tap() to "mousedown" event of the target', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mousedown'), 'target.on("mousedown")').calledOnce
                .and.calledWithExactly('mousedown', sinon.match.func);

            expect(this.service.tap).not.called;

            this.target.on.withArgs('mousedown').firstCall.args[1](this.ev);

            expect(this.service.tap, 'service.tap()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);

            expect(this.target.on.withArgs('touchstart'), 'on("touchstart")').to.not.called;
        });

        it('should attach both "touchstart" and "mousedown" events if $window.ontouchstart is defined', function () {
            this.$window.ontouchstart = 'defined';
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mousedown'), 'target.on("mousedown")').calledOnce
                .and.calledWithExactly('mousedown', sinon.match.func);
            expect(this.target.on.withArgs('touchstart'), 'target.on("touchstart")').calledOnce
                .and.calledWithExactly('touchstart', sinon.match.func);
                expect(this.service.tap).not.called;

            this.target.on.withArgs('touchstart').firstCall.args[1](this.ev);

            expect(this.service.tap, 'service.tap()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);
        });

        it('should bind service.move() to "mousemove" event of the target', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mousemove'), 'target.on("mousemove")').calledOnce
                .and.calledWithExactly('mousemove', sinon.match.func);

            expect(this.service.move).not.called;

            this.target.on.withArgs('mousemove').firstCall.args[1](this.ev);

            expect(this.service.move, 'service.move()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);

            expect(this.target.on.withArgs('touchmove'), 'target.on("touchmove")').not.called;
        });

        it('should bind service.move() to both "touchmove" and "mousemove" if $window.ontouchstart is defined', function () {
            this.$window.ontouchstart = 'defined';
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mousemove'), 'target.on("mousemove")').calledOnce
                .and.calledWithExactly('mousemove', sinon.match.func);
            expect(this.target.on.withArgs('touchmove'), 'target.on("touchmove")').calledOnce
                .and.calledWithExactly('touchmove', sinon.match.func);

            expect(this.service.move).not.called;

            this.target.on.withArgs('touchmove').firstCall.args[1](this.ev);

            expect(this.service.move, 'service.move()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);
        });

        it('should bind service.release() to "mouseup" event of the target', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mouseup'), 'target.on("mouseup")').calledOnce
                .and.calledWithExactly('mouseup', sinon.match.func);

            expect(this.service.release).not.called;

            this.target.on.withArgs('mouseup').firstCall.args[1](this.ev);

            expect(this.service.release, 'service.release()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);
        });

        it('should bind service.release() to "mouseleave" event of the target', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('mouseleave'), 'target.on("mouseleave")').calledOnce
                .and.calledWithExactly('mouseleave', sinon.match.func);

            expect(this.service.release).not.called;

            this.target.on.withArgs('mouseleave').firstCall.args[1](this.ev);

            expect(this.service.release, 'service.release()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);
        });

        it('should bind service.release() to "touchend" event if $window.ontouchstart is defined', function () {
            this.$window.ontouchstart = 'defined';
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.target.on.withArgs('touchend'), 'target.on("touchend")').calledOnce
                .and.calledWithExactly('touchend', sinon.match.func);

            expect(this.service.release).not.called;

            this.target.on.withArgs('touchend').firstCall.args[1](this.ev);

            expect(this.service.release, 'service.release()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly(this.ev);
        });

        it('should bind service.wheel() to one of "wheel", "mousewheel", "MozMousePixelScroll"', function () {
            this.$document[0].onwheel = null;
            var service = this.PM.attachTo(this.target, this.options);
            expect(this.target.on.withArgs('wheel')).calledOnce
                .and.calledWithExactly('wheel', sinon.match.func);
            this.target.on.withArgs('wheel').firstCall.args[1](this.ev);

            expect(this.service.wheel, 'service.wheel()').calledOnce
                .and.calledWithExactly(this.ev);

            delete this.$document[0].onwheel;
            this.$document[0].onmousewheel = null;
            this.service.wheel.reset();
            service = this.PM.attachTo(this.target, this.options);
            expect(this.target.on.withArgs('mousewheel')).calledOnce
                .and.calledWithExactly('mousewheel', sinon.match.func);
            this.target.on.withArgs('mousewheel').firstCall.args[1](this.ev);
            expect(this.service.wheel, 'service.wheel()').calledOnce
                .and.calledWithExactly(this.ev);

            delete this.$document[0].onmousewheel;
            this.service.wheel.reset();
            service = this.PM.attachTo(this.target, this.options);
            expect(this.target.on.withArgs('MozMousePixelScroll')).calledOnce
                .and.calledWithExactly('MozMousePixelScroll', sinon.match.func);
            this.target.on.withArgs('MozMousePixelScroll').firstCall.args[1](this.ev);
            expect(this.service.wheel, 'service.wheel()').calledOnce
                .and.calledWithExactly(this.ev);
        });
    });




    describe('.Movements()', function () {
        beforeEach( function () {
            this.onmove = sinon.spy();
            this.onclick = sinon.spy();
            this.clickThreshold = 8;

            this.pm = new this.PM.Movements({
                onmove:     this.onmove,
                onclick:    this.onclick,
                clickThreshold: this.clickThreshold
            });
        });

        it('should be a constructor function', function () {
            expect(this.PM).itself.to.respondTo('Movements');
        });

        it('should set onmove and onclick listeners', function () {
            expect(this.pm.onclick).to.equal(this.onclick);
            expect(this.pm.onmove).to.equal(this.onmove);
        });

        it('should set clickThreshold from options', function () {
            expect(this.pm.clickThreshold).to.equal(this.clickThreshold);
        });



        describe('#getDeltaX(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getDeltaX');
            });

            it('should return ev.deltaX', function () {
                expect(this.pm.getDeltaX({deltaX: 100})).to.equal(100);
            });

            it('should respect jQuery events', function () {
                expect(this.pm.getDeltaX({originalEvent: {deltaX: 100}})).to.equal(100);
            });
        });



        describe('#getX(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getX');
            });

            it('should return ev.pageX for mouse events', function () {
                var ev = {pageX: 100};
                var res = this.pm.getX(ev);
                expect(res).to.equal(ev.pageX);
            });

            it('should recognize jQuery events', function () {
                var ev = {originalEvent: {pageX: 100}};
                var res = this.pm.getX(ev);
                expect(res).to.equal(ev.originalEvent.pageX);
            });

            it('should return clientX of the first target touchpoint', function () {
                var ev = {
                    targetTouches: [{clientX: 100}, {clientX: 200}],
                    pageX: -1
                };
                var res = this.pm.getX(ev);
                expect(res).to.equal(ev.targetTouches[0].clientX);
            });

            it('should recognize touch events wrapped in jQuery', function () {
                var touches = [{clientX: 100}, {clientX: 200}];
                var ev = {
                    originalEvent: {
                        targetTouches: touches
                    },
                    pageX: -1
                };
                var res = this.pm.getX(ev);
                expect(res).to.equal(touches[0].clientX);
            });
        });




        describe('isEventRelevant(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('isEventRelevant');
            });

            it('should return false if ev is not an object', function () {
                var fevs = [null, 12, "acv", function () {}, undefined];
                var pm = this.pm;

                fevs.forEach( function (ev) {
                    expect(pm.isEventRelevant(ev)).to.be.false;
                });
            });

            it('should return false if which!==1 for mouse events', function () {
                var ev = {
                    type: 'mousemove',
                    which: 3
                };
                expect(this.pm.isEventRelevant(ev)).to.be.false;
            });

            it('should return true if which===1 for mouse events', function () {
                var ev = {
                    type: 'mousemove',
                    which: 1
                };
                expect(this.pm.isEventRelevant(ev)).to.be.true;
            });

            it('should return true for touch events', function () {
                var ev = {
                    type: 'touchmove',
                    which: 3
                };
                expect(this.pm.isEventRelevant(ev)).to.be.true;
            });

            it('should return flase for wheel events if deltaX is 0', function () {
                var ev = {deltaX: 0};
                var pm = this.pm;
                'wheel,mousewheel,MozMousePixelScroll'.split(',').forEach(function (type) {
                    ev.type = type;
                    expect(pm.isEventRelevant(ev)).to.be.false;
                });
            });

            it('should return true for wheel events when deltaX is not 0', function () {
                var ev = {};
                var pm = this.pm;
                'wheel,mousewheel,MozMousePixelScroll'.split(',').forEach(function (type, k) {
                    ev.type = type;
                    ev.deltaX = 2*(k+1)*Math.pow(-1, k); // positive and negative numbers %-)
                    expect(pm.isEventRelevant(ev)).to.be.true;
                });
            });

            it('should recognize jQuery events', function () {
                var ev = {type: 'wheel', originalEvent: {deltaX: 0}};
                expect(this.pm.isEventRelevant(ev)).to.be.false;

                ev.originalEvent.deltaX = -10;
                expect(this.pm.isEventRelevant(ev)).to.be.true;
            });
        });




        describe('#getMaxShift()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getMaxShift');
            });

            it('should return 0 by default', function () {
                expect(this.pm.getMaxShift()).to.equal(0);
            });
        });



        describe('#getReference()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getReference');
            });

            it('should return null by default', function () {
                expect(this.pm.getReference()).to.be.null;
            });
        });



        describe('#getOrigin()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getOrigin');
            });

            it('should return null by default', function () {
                expect(this.pm.getOrigin()).to.be.null;
            });
        });



        describe('#getScroll()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getScroll');
            });

            it('should return 0 by default', function () {
                expect( this.pm.getScroll() ).to.equal(0);
            });
        });


        describe('#getWheelReleaseTimer()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getWheelReleaseTimer');
            });

            it('should return null by default', function () {
                expect(this.pm.getWheelReleaseTimer()).to.be.null;
            });
        });



        describe('#getVelocity()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getVelocity');
            });

            it('should return 0 by default', function () {
                var v = this.pm.getVelocity();
                expect(v).to.equal(0);
            });
        });




        describe('#tap(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.ev.which = 1;
                this.ev.pageX = 200;
                this.ev.type = 'mousedown';
                this.pm.isEventRelevant = sinon.stub().returns(true);
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('tap');
            });

            it('should set reference and origin to ev.pageX', function () {
                this.pm.tap(this.ev);
                expect(this.pm.getReference()).to.equal(this.ev.pageX);
                expect(this.pm.getOrigin()).to.equal(this.ev.pageX);
            });

            it('should ignore non-relevant events', function () {
                this.pm.isEventRelevant.returns(false);
                this.pm.tap(this.ev);
                expect(this.pm.getReference()).to.be.null;
                expect(this.pm.getOrigin()).to.be.null;
            });

            it('should stop event', function () {
                this.pm.tap(this.ev);
                expect(this.ev.preventDefault).called;
                expect(this.ev.stopPropagation).called;
            });
        });



        describe('#move(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.pm.isEventRelevant = sinon.stub().returns(true);

                this.ev.pageX = 100;
                this.pm.tap(this.ev);
                this.ev.$reset();

                this.ev.pageX = 200;
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('move');
            });

            it('should call "move" listener with the shift = pageX - reference', function () {
                this.pm.move(this.ev);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(100);
            });

            it('should move reference to pageX', function () {
                this.pm.move(this.ev);
                expect(this.pm.getReference()).to.equal(this.ev.pageX);
            });

            it('should do nothing if no mousedown event occured before', function () {
                this.pm._cleanState();
                this.pm.move(this.ev);
                expect(this.pm.getReference()).to.be.null;
            });

            it('should do nothing if wheel scrolling is active', function () {
                var spy = sinon.spy(this.pm, 'getX');
                this.pm._state.wheelTimer = {};
                this.pm.move(this.ev);
                expect(spy).not.called;
                spy.restore();
            });

            it('should stop event', function () {
                this.pm.move(this.ev);
                expect(this.ev.preventDefault).called;
                expect(this.ev.stopPropagation).called;
            });

            it('should calculate the maxShift', function () {
                var _this = this;

                [110, 90, 80, 112].forEach( function (x) {
                    _this.ev.pageX = x;
                    _this.pm.move(_this.ev);
                });

                expect(this.pm.getMaxShift()).to.equal(20);
            });

            it('should update velocity', function () {
                this.pm._cleanState;
                var clock = sinon.useFakeTimers();
                var v = 0;
                var vx, ve;

                this.ev.pageX = 100;
                this.pm.tap(this.ev);
                clock.tick(500);
                this.ev.pageX += 10;
                this.pm.move(this.ev);
                vx = Math.ceil(this.pm.getVelocity());
                ve = Math.ceil(0.8*1000*10/501 + 0.2*v);

                expect(vx).to.equal(ve);

                v=vx;
                clock.tick(500)
                this.ev.pageX += 10;
                this.pm.move(this.ev);
                vx = this.pm.getVelocity();
                vx = Math.ceil(this.pm.getVelocity());
                ve = Math.ceil(0.8*1000*10/501 + 0.2*v);

                clock.restore();
            });
        });



        describe('#release(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.pm.isEventRelevant = sinon.stub().returns(true);
                this.pm.autoscroll = sinon.spy();
                this.ev.pageX = 100;
                this.pm.tap(this.ev);
                this.ev.$reset();

                this.ev.type = 'mouseup';
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('release');
            });

            it('should call autoscroll if |velocity| > 10', function () {
                var clock = sinon.useFakeTimers();
                this.pm.getVelocity = sinon.stub().returns(-15);

                this.ev.pageX += 100;
                clock.tick(500);
                this.pm.move(this.ev);

                this.pm.release(this.ev);

                expect(this.pm.autoscroll, 'pm.autoscroll()').calledOnce
                    .and.calledWithExactly(-15*0.8, 500);

                clock.restore();
            });

            it('should set reference to null', function () {
                this.pm.release(this.ev);
                expect(this.pm.getReference()).to.be.null;
            });

            it('should stop event', function () {
                this.pm.release(this.ev);
                expect(this.ev.preventDefault, 'ev.preventDefault()').calledOnce
                    .and.calledWithExactly();
                expect(this.ev.stopPropagation, 'ev.stopPropagation()').calledOnce
                    .and.calledWithExactly();
            });

            describe('when maxShift is less than click threshold', function () {
                beforeEach( function () {
                    this.ev.pageX = this.pm.getOrigin() + this.clickThreshold - 1;
                    this.pm.move(this.ev);
                    this.ev.$reset();
                    this.onmove.reset();
                    this.onclick.reset();
                });

                it('should shift back to the origin', function () {
                    var shift = this.pm.getOrigin() - this.pm.getReference();

                    this.pm.release(this.ev);

                    expect(this.onmove, 'onmove()').calledOnce
                        .and.calledWithExactly(shift);
                });

                it('should call .onclick(target)', function () {
                    var target = this.ev.target = {an: 'event target'};
                    this.pm.release(this.ev);
                    expect(this.onclick, 'onclick()').calledOnce
                        .and.calledWithExactly(target);
                });

                it('should not call the onclick if ev.type is "mouseleave"', function () {
                    var target = this.ev.target = {an: 'event target'};
                    this.ev.type = 'mouseleave';
                    this.pm.release(this.ev);
                    expect(this.onclick, 'onclick()').not.called;
                });

                it('should not call autoscroll', function () {
                    var target = this.ev.target = {an: 'event target'};
                    this.pm.release(this.ev);
                    expect(this.pm.autoscroll, 'pm.autoscroll()').not.called;
                });
            });
        });



        describe('#wheel(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.pm.isEventRelevant = sinon.stub().returns(true);
                this.pm._tap = sinon.spy();
                this.pm._move = sinon.spy();
                this.pm.release = sinon.spy();
                this.pm._startWheelReleaseTimer = sinon.spy();
                this.pm.getOrigin = sinon.stub();

                this.ev.$reset();
                this.ev.deltaX = 1;
                this.ev.pageX = 100;
                this.ev.type = 'wheel';

                this.X = 200;
                this.pm.getX = sinon.stub().withArgs(this.ev).returns(this.X);
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('wheel');
            });

            it('should call #_tap and start wheel release timer if reference is not set yet', function () {
                this.pm._state.reference = null;

                this.pm.wheel(this.ev);

                expect(this.pm._tap, 'pm._tap()').calledOnce
                    .and.calledWithExactly(this.X);
                expect(this.pm._startWheelReleaseTimer, 'pm._startWheelReleaseTimer()').calledOnce
                    .and.calledWithExactly();
            });

            it('should should do nothing if event is non-relevant', function () {
                this.pm.isEventRelevant.returns(false);
                this.pm.wheel(this.ev);
                expect(this.pm._startWheelReleaseTimer, 'pm._startWheelReleaseTimer()')
                    .not.called;
            });

            it('should update scroll value', function () {
                this.pm._state.scroll = 0;
                this.pm.wheel(this.ev);
                expect(this.pm._state.scroll).to.not.equal(0);
            });

            it('should stop event', function () {
                this.pm.wheel(this.ev);
                expect(this.ev.preventDefault).calledOnce;
                expect(this.ev.stopPropagation).calledOnce;
            });
        });



        describe('#_startWheelReleaseTimer(ev)', function () {
            beforeEach( function () {
                this.ev = {
                    type: 'wheel',
                    pageX: 100,
                    deltaX: 200
                };
                this.pm._tap = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('_startWheelReleaseTimer');
            });

            it('should start wheelTimer', function () {
                this.pm._startWheelReleaseTimer(this.ev);

                expect(this.$timeout, '$timeout()').calledOnce
                    .and.calledWithExactly(sinon.match.func, sinon.match.number, false);
            });

            describe('timeout function', function () {
                beforeEach( function () {
                    this.pm._release = sinon.spy();
                    this.pm._move = sinon.spy();
                    this.pm._startWheelReleaseTimer(this.ev);
                    this.callback = this.$timeout.firstCall.args[0];
                });

                it('should call #_release without arguments if scroll is 0', function () {
                    this.pm._state.scroll = 0;
                    this.callback();
                    expect(this.pm._release, 'pm._release()').calledOnce
                        .and.calledWithExactly();
                });

                it('should call #_move if scroll is not 0', function () {
                    var scroll = this.pm._state.scroll = 10;
                    var reference = this.pm._state.reference = 20;
                    this.callback();

                    expect(this.pm._move, 'pm._move()').calledOnce
                        .and.calledWithExactly(scroll+reference);
                });

                it('should update reference and reset scroll if the latter is not 0', function () {
                    var scroll = this.pm._state.scroll = 10;
                    var reference = this.pm._state.reference = 20;
                    this.callback();

                    expect(this.pm._state.reference).to.equal(scroll+reference);
                    expect(this.pm._state.scroll).to.equal(0);
                });

                it('should restart wheel release timer', function () {
                    var spy = this.pm._startWheelReleaseTimer = sinon.spy();
                    var scroll = this.pm._state.scroll = 10;
                    var reference = this.pm._state.reference = 20;
                    this.callback();

                    expect(spy).calledOnce.and.calledWithExactly();
                });
            });
        });



        describe('#autoscroll(amplitude, time, prevShift)', function () {
            beforeEach( function () {
                this.pm.autoshift = sinon.stub();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('autoscroll');
            });

            it('should immediately request animation frame for call self with prevShift=0 when prevShift is not given', function () {
                this.pm.autoscroll(15, 100);

                expect(this.$window.requestAnimationFrame, '$window.requestAnimationFrame()').calledOnce
                    .and.calledWithExactly(sinon.match.func);

                this.pm.autoscroll = sinon.spy();
                this.$window.requestAnimationFrame.firstCall.args[0]();

                expect(this.pm.autoscroll, 'autoscroll').calledOnce
                    .and.calledWithExactly(15, 100, 0);

                expect(this.onmove).not.called;


            });

            it('should calculate shift when prevShift is a number', function () {
                this.pm.autoshift.returns(10);
                this.pm.autoscroll(15, 100, 0);

                expect(this.pm.autoshift).calledOnce
                    .and.calledWithExactly(15, 100);
            });

            it('should call onmove with shift-prevShift when prevShift is a number', function () {
                this.pm.autoshift.returns(10);
                this.pm.autoscroll(15, 100, 5);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(5);
            });

            it('should request animation frame with self, prevShift=shift if |shift| >= 0.5', function () {
                this.pm.autoshift.returns(10);
                this.pm.autoscroll(15, 100, 5);

                expect(this.$window.requestAnimationFrame, '$window.requestAnimationFrame()').calledOnce
                    .and.calledWithExactly(sinon.match.func);

                this.pm.autoscroll = sinon.spy();

                this.$window.requestAnimationFrame.firstCall.args[0]();

                expect(this.pm.autoscroll, 'pm.autoscroll()').calledOnce
                    .and.calledWithExactly(15, 100, 10);
            });

            it('should not request animation frame when |shift-amplitude| < 0.5', function () {
                this.pm.autoshift.returns(14.6);
                this.pm.autoscroll(15, 100, 5);

                expect(this.$window.requestAnimationFrame).not.called;
            });

            it('should call onmove with amplitude - prevShift when |shift - amplitude| < 0.5', function () {
                this.pm.autoshift.returns(14.6);
                this.pm.autoscroll(15, 100, 5);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(10);
            });
        });


        describe('#autoshift(amplitude, t0)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('autoshift');
            });
        });



    });
});
