describe.only('PointerMovementsService', function () {
    beforeEach(module('tutScroller'));

    beforeEach( function () {
        var _this = this;

        this.$window = {
            requestAnimationFrame: sinon.spy(),
            addEventListener:      sinon.spy()
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
                'onmousewheel', 'resize'].forEach( function (en) {
                    target.on.withArgs(en);
                });

            this.options = {the: 'options'};

            this.service = {
                tap:    sinon.spy(),
                move:   sinon.spy(),
                release:sinon.spy(),
                wheel:  sinon.spy(),
                resize: sinon.spy()
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



        it('should bind service.resize() to "resize" event of window', function () {
            var service = this.PM.attachTo(this.target, this.options);

            expect(this.$window.addEventListener, '$window.addEventListener').calledOnce
                .and.calledWithExactly('resize', sinon.match.func);

            expect(this.service.resize).not.called;

            this.$window.addEventListener.firstCall.args[1]();

            expect(this.service.resize, 'service.resize()').calledOnce
                .and.calledOn(this.service)
                .and.calledWithExactly();

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
            this.onresize = sinon.spy();
            this.clickThreshold = 8;

            this.pm = new this.PM.Movements({
                onmove:     this.onmove,
                onclick:    this.onclick,
                onresize:   this.onresize,
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

        it('should set .mode to "x" by default', function () {
            expect(this.pm.mode).to.equal('x');
        });



        describe('#throttle()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('throttle');
            });

            it('should set _state.throttle to true', function () {
                expect(this.pm._state.throttle).to.be.false;
                this.pm.throttle();
                expect(this.pm._state.throttle).to.be.true;
            });

            it('should request animation frame', function () {
                this.pm.throttle();
                expect(this.$window.requestAnimationFrame, '$window.requestAnimationFrame()').calledOnce
                    .and.calledWithExactly(sinon.match.func);
            });

            it('should set throttle to false on next animation frame', function () {
                this.pm.throttle();
                this.$window.requestAnimationFrame.firstCall.args[0]();
                expect(this.pm._state.throttle).to.be.false;
            });
        });



        describe('#resize()', function () {
            beforeEach( function () {
                this.pm.throttle = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('resize');
            });

            it('should call onresize', function () {
                this.pm.resize();
                expect(this.onresize, 'onresize()').calledOnce
                    .and.calledWithExactly();
            });

            it('should do nothing if the throttle is active', function () {
                this.pm._state.throttle = true;
                this.pm.resize();
                expect(this.onresize, 'onresize()').not.called;
            });

            it('should activate the throttle', function () {
                this.pm.resize();

                expect(this.pm.throttle, 'pm.throttle()').calledOnce
                    .and.calledWithExactly();
            });

            it('should not activate throttle if there is no resize listener', function () {
                this.pm.onresize = null;
                this.pm.resize();

                expect(this.pm.throttle, 'pm.throttle()').not.called;
            });
        });




        describe('#getDeltaXY(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getDeltaXY');
            });

            it('should return [ev.deltaX, ev.deltaY]', function () {
                expect(this.pm.getDeltaXY({deltaX: 100, deltaY: 200}))
                    .to.deep.equal([100, 200]);
            });

            it('should respect jQuery events', function () {
                expect(this.pm.getDeltaXY({originalEvent: {deltaX: 100, deltaY: 200}}))
                    .to.deep.equal([100, 200]);
            });
        });



        describe('#getXY(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getXY');
            });

            it('should return [ev.pageX, eb.pageY] for mouse events', function () {
                var ev = {pageX: 100, pageY: 200};
                var res = this.pm.getXY(ev);
                expect(res).to.deep.equal([ev.pageX, ev.pageY]);
            });

            it('should return [clientX, clientY] of the first target touchpoint', function () {
                var ev = {
                    targetTouches: [{clientX: 100, clientY: 200}, {clientX: 300, clientY: 400}],
                    pageX: -1, pageY: -1
                };

                var res = this.pm.getXY(ev);
                expect(res).to.deep.equal([ev.targetTouches[0].clientX, ev.targetTouches[0].clientY]);
            });

            it('should recognize touch events wrapped in jQuery', function () {
                var touches = [{clientX: 100, clientY: 200}, {clientX: 300, clientY: 400}];
                var ev = {
                    originalEvent: {
                        targetTouches: touches
                    },
                    pageX: -1, pageY: -1
                };
                var res = this.pm.getXY(ev);

                expect(res).to.deep.equal([touches[0].clientX, touches[0].clientY]);
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
                var ev = {deltaX: 0, deltaY: 0};
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
                var ev = {type: 'wheel', originalEvent: {deltaX: 0,deltaY: 0}};
                expect(this.pm.isEventRelevant(ev)).to.be.false;

                ev.originalEvent.deltaX = -10;
                expect(this.pm.isEventRelevant(ev)).to.be.true;
            });
        });




        describe('#getMaxShift()', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getMaxShift');
            });

            it('should return [0, 0] by default', function () {
                expect(this.pm.getMaxShift()).to.deep.equal([0, 0]);
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

            it('should return [0, 0] by default', function () {
                expect( this.pm.getScroll() ).to.deep.equal([0, 0]);
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

            it('should return [0, 0] by default', function () {
                var v = this.pm.getVelocity();
                expect(v).to.deep.equal([0, 0]);
            });
        });




        describe('#isVelocityAbove(v)', function () {
            beforeEach( function () {
                this.v = [100, 200];
                this.stub = sinon.stub(this.pm, 'getVelocity').returns(this.v);
            });

            afterEach( function () {
                this.stub.restore();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('isVelocityAbove');
            });

            it('should return (vx > v) in x mode', function () {
                var v = this.v[0];
                expect( this.pm.isVelocityAbove(v) ).to.be.false;
                expect( this.pm.isVelocityAbove(v-0.001) ).to.be.true;
            });

            it('should return (vy > v) in y mode', function () {
                this.pm.mode = 'y';
                var v = this.v[1];

                expect( this.pm.isVelocityAbove(v) ).to.be.false;
                expect( this.pm.isVelocityAbove(v-0.001) ).to.be.true;
            });

            it('should return (vx^2 + vy^2 > v^2) in y mode', function () {
                this.pm.mode = 'xy';
                var vxy = this.v;
                var v = Math.sqrt(vxy[0]*vxy[0] + vxy[1]*vxy[1]);

                expect( this.pm.isVelocityAbove(v) ).to.be.false;
                expect( this.pm.isVelocityAbove(v-0.001) ).to.be.true;
            });

        });




        describe('#isShiftAbove(s)', function () {
            beforeEach( function () {
                this.maxShift = [100, 200];
                this.pm.getMaxShift = sinon.stub().returns(this.maxShift);
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('isShiftAbove');
            });

            it('should return maxShift.x^2 + maxShift.y^2 > s^2', function () {
                var x = this.maxShift[0];
                var y = this.maxShift[1];
                var s = Math.sqrt(x*x + y*y);

                expect( this.pm.isShiftAbove(s) ).to.be.false;
                expect( this.pm.isShiftAbove(s-0.00001) ).to.be.true;
            });
        });




        describe('#tap(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.pm.isEventRelevant = sinon.stub().returns(true);
                this.XY = [100, 200];
                this.pm.getXY = sinon.stub().returns(this.XY);
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('tap');
            });

            it('should ignore non-relevant events', function () {
                this.pm.isEventRelevant.returns(false);
                this.pm.tap(this.ev);
                expect(this.pm.getReference()).to.be.null;
                expect(this.pm.getOrigin()).to.be.null;
            });


            it('should set reference and origin to #getXY(ev)', function () {
                this.pm.tap(this.ev);
                expect(this.pm.getReference()).to.deep.equal(this.XY);
                expect(this.pm.getOrigin()).to.deep.equal(this.XY);
                expect(this.pm.getXY, 'pm.getXY()').calledOnce
                    .and.calledWithExactly(this.ev);
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

                this.XY0 = [100, 200];
                this.XY  = [200, 500];
                this.pm.getXY = sinon.stub();
                this.pm.getXY.onCall(0).returns(this.XY0);
                this.pm.getXY.onCall(1).returns(this.XY);

                this.pm.tap(this.ev);
                this.ev.$reset();

                this.pm.throttle = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('move');
            });

            it('should call "move" listener with the dx, dy (ev.pos - reference)', function () {
                this.pm.move(this.ev);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(this.XY[0]-this.XY0[0], this.XY[1] - this.XY0[1]);
            });

            it('should move reference to the event position', function () {
                this.pm.move(this.ev);
                expect(this.pm.getReference()).to.deep.equal(this.XY);
            });

            it('should activate the throttle', function () {
                this.pm.move(this.ev);
                expect(this.pm.throttle, 'pm.throttle()').calledOnce
                    .and.calledWithExactly();
            });

            it('should do nothing if no mousedown event occured before', function () {
                this.pm._cleanState(); // virtually: no mousedown yet
                this.pm.getXY.reset();
                this.pm.move(this.ev);
                expect(this.pm.getXY).not.called;
            });

            it('should do nothing if wheel scrolling is active', function () {
                this.pm._state.wheelTimer = {};
                this.pm.getXY.reset();
                this.pm.move(this.ev);
                expect(this.pm.getXY).not.called;
            });

            it('should do nothing if throttle is active', function () {
                this.pm.getXY.reset();
                this.pm._state.throttle = true;
                this.pm.move(this.ev);
                expect(this.pm.getXY).not.called;
            });

            it('should stop event', function () {
                this.pm.move(this.ev);
                expect(this.ev.preventDefault).called;
                expect(this.ev.stopPropagation).called;
            });

            it('should calculate the maxShift (x, y)', function () {
                var _this = this;
                _this.pm.getXY = sinon.stub();

                [[110, 220], [90, 180], [80, 160], [112, 224]].forEach( function (xy) {
                    _this.pm.getXY.returns(xy);
                    _this.pm.move(_this.ev);
                });

                expect(this.pm.getMaxShift()).to.deep.equal([20, 40]);
            });

            it('should update velocity', function () {
                this.pm._cleanState; // NOTE: first employ fake timers, second - do the calculations

                var clock = sinon.useFakeTimers();
                var dxy = [10, 20];
                var dt  = 500; // ms
                var xy = [this.XY0[0] + dxy[0], this.XY0[1] + dxy[1]];
                var v = [0, 0];
                var vx, ve;

                this.pm.getXY = sinon.stub().returns(this.XY0);
                this.pm.tap(this.ev);

                clock.tick(dt);
                this.pm.getXY.returns(xy);
                this.pm.move(this.ev);

                vx = this.pm.getVelocity();
                vx[0] = Math.ceil(vx[0]);
                vx[1] = Math.ceil(vx[1]);

                ve = [
                    Math.ceil(0.8*1000*dxy[0]/(1+dt) + 0.2*v[0]),
                    Math.ceil(0.8*1000*dxy[1]/(1+dt) + 0.2*v[1])
                ];

                expect(vx).to.deep.equal(ve);

                v=vx;
                clock.tick(dt)
                xy = [xy[0] + dxy[0], xy[1] + dxy[1]];
                this.pm.getXY.returns(xy);
                this.pm.move(this.ev);

                vx = this.pm.getVelocity();
                vx[0] = Math.ceil(vx[0]);
                vx[1] = Math.ceil(vx[1]);

                ve = [
                    Math.ceil(0.8*1000*dxy[0]/(1+dt) + 0.2*v[0]),
                    Math.ceil(0.8*1000*dxy[1]/(1+dt) + 0.2*v[1])
                ];

                expect(vx).to.deep.equal(ve);

                clock.restore();
            });
        });



        describe('#release(ev)', function () {
            beforeEach( function () {
                this.pm._cleanState();
                this.pm.isEventRelevant = sinon.stub().returns(true);
                this.pm.autoscroll = sinon.spy();
                this.pm.getOrigin = sinon.stub().returns([0, 0]);
                this.pm.getReference = sinon.stub().returns([10, 10]);
                this.pm.getVelocity = sinon.stub();
                this.pm.isShiftAbove = sinon.stub();
                this.pm.isVelocityAbove = sinon.stub();
                this.pm._cleanState = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('release');
            });

            it('should call autoscroll if velocity > 10 and maxShift is above threshold', function () {
                this.pm.isVelocityAbove.returns(true);
                this.pm.isShiftAbove.returns(true);
                this.pm.getVelocity.returns([-15, 0]);
                var t = this.pm._state.timestamp = 500;
                this.pm.release(this.ev);

                expect(this.pm.autoscroll, 'pm.autoscroll()').calledOnce
                    .and.calledWithExactly([-15, 0], t);
            });

            it('should reset the state', function () {
                this.pm.release(this.ev);
                expect(this.pm._cleanState, 'pm._cleanState()').calledOnce
                    .and.calledWithExactly();
            });

            it('should stop event', function () {
                this.pm.release(this.ev);
                expect(this.ev.preventDefault, 'ev.preventDefault()').calledOnce
                    .and.calledWithExactly();
                expect(this.ev.stopPropagation, 'ev.stopPropagation()').calledOnce
                    .and.calledWithExactly();
            });

            describe('when maxShift is below the threshold', function () {
                beforeEach( function () {
                    this.pm.isShiftAbove.returns(false);
                });

                it('should shift back to the origin', function () {
                    var origin = this.pm.getOrigin();
                    var reference = this.pm.getReference();

                    this.pm.release(this.ev);
                    expect(origin).to.exist;
                    expect(reference).to.exist;
                    expect(this.onmove, 'onmove()').calledOnce
                        .and.calledWithExactly(origin[0]-reference[0], origin[1]-reference[1]);
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
                this.XY = [200, 300];
                this.pm.getXY = sinon.stub().withArgs(this.ev).returns(this.XY);
                this.pm.throttle = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('wheel');
            });

            it('should call #_tap and start wheel release timer if reference is not set yet', function () {
                this.pm._cleanState();

                this.pm.wheel(this.ev);

                expect(this.pm._tap, 'pm._tap()').calledOnce
                    .and.calledWithExactly(this.XY);
                expect(this.pm._startWheelReleaseTimer, 'pm._startWheelReleaseTimer()').calledOnce
                    .and.calledWithExactly();
            });

            it('should should do nothing if event is non-relevant', function () {
                this.pm.isEventRelevant.returns(false);
                this.pm.wheel(this.ev);
                expect(this.pm._startWheelReleaseTimer, 'pm._startWheelReleaseTimer()')
                    .not.called;
            });

            it('should do nothing if throttle is active', function () {
                this.pm._state.throttle = true;
                this.pm.wheel(this.ev);
                expect(this.pm._startWheelReleaseTimer, 'pm._startWheelReleaseTimer()')
                    .not.called;
            });

            it('should activate the throttle', function () {
                this.pm.wheel(this.ev);
                expect(this.pm.throttle, 'pm.throttle()').calledOnce
                    .and.calledWithExactly();
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
                this.pm.autoscroll([10, 20], 100);

                expect(this.$window.requestAnimationFrame, '$window.requestAnimationFrame()').calledOnce
                    .and.calledWithExactly(sinon.match.func);

                this.pm.autoscroll = sinon.spy();
                this.$window.requestAnimationFrame.firstCall.args[0]();

                expect(this.pm.autoscroll, 'autoscroll').calledOnce
                    .and.calledWithExactly([8, 16], 100, [0, 0]); // note: on initial call amplityde should be reduced by the factor of 0.8

                expect(this.onmove).not.called;


            });

            it('should calculate shift when prevShift is a number', function () {
                this.pm.autoshift.returns([5, 10]);
                this.pm.autoscroll([10, 20], 100, [0, 0]);

                expect(this.pm.autoshift).calledOnce
                    .and.calledWithExactly([10, 20], 100);
            });

            it('should call onmove with shift-prevShift when prevShift is a number', function () {
                this.pm.autoshift.returns([10, 15]);
                this.pm.autoscroll([15, 30], 100, [5, 6]);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(5, 9);
            });

            it('should request animation frame with self, prevShift=shift if |shift| >= 0.5', function () {
                this.pm.autoshift.returns([10, 10]);
                this.pm.autoscroll([15, 15], 100, [5, 5]);

                expect(this.$window.requestAnimationFrame, '$window.requestAnimationFrame()').calledOnce
                    .and.calledWithExactly(sinon.match.func);

                this.pm.autoscroll = sinon.spy();
                this.$window.requestAnimationFrame.firstCall.args[0]();

                expect(this.pm.autoscroll, 'pm.autoscroll()').calledOnce
                    .and.calledWithExactly([15, 15], 100, [10, 10]);
            });

            it('should not request animation frame when |shift-amplitude| < 0.5', function () {
                this.pm.autoshift.returns([14.6, 14.6]);
                this.pm.autoscroll([15, 15], 100, [5, 5]);

                expect(this.$window.requestAnimationFrame).not.called;
            });

            it('should call onmove with amplitude - prevShift when |shift - amplitude| < 0.5', function () {
                this.pm.autoshift.returns([14.6, 14.6]);
                this.pm.autoscroll([15, 15], 100, [5, 5]);

                expect(this.onmove, 'onmove()').calledOnce
                    .and.calledWithExactly(10, 10);
            });
        });


        describe('#autoshift(amplitude, t0)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('autoshift');
            });
        });



    });
});
