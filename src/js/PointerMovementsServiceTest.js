describe.only('PointerMovementsService', function () {
    beforeEach(module('tutScroller'));

    beforeEach( function () {
        var _this = this;

        this.$window = {
            requestAnimationFrame: sinon.spy()
        };

        module( function($provide) {
            $provide.value('$window', _this.$window);
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



    describe('.attachTo(target)', function () {
        beforeEach( function () {
            var target = this.target = {
                on: sinon.spy()
            };

            ['mousedown', 'mousemove', 'mouseup', 'mouseleave',
                'touchstart', 'touchmove', 'touchend'].forEach( function (en) {
                    target.on.withArgs('mouseleave')
                });

            this.options = {the: 'options'};

            this.service = {
                tap:    sinon.spy(),
                move:   sinon.spy(),
                release:sinon.spy()
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

        describe('#getX(ev)', function () {
            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('getX');
            });

            it('should retunr ev.pageX for mouse events', function () {
                var ev = {pageX: 100};
                var res = this.pm.getX(ev);
                expect(res).to.equal(ev.pageX);
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
            });

            it('should be an instance method', function () {
                expect(this.PM.Movements).to.respondTo('tap');
            });

            it('should set reference and origin to ev.pageX', function () {
                this.pm.tap(this.ev);
                expect(this.pm.getReference()).to.equal(this.ev.pageX);
                expect(this.pm.getOrigin()).to.equal(this.ev.pageX);
            });

            it('should work only for left button', function () {
                this.ev.which = 2;
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

                it('should not call the onclick if ev.type is not "mouseup"', function () {
                    var target = this.ev.target = {an: 'event target'};
                    this.ev.type = 'mousemove';
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
