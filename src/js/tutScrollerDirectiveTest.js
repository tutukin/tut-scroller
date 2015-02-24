describe('tutScroller directive', function () {
    beforeEach(function (done) {
        var _this = this;

        module('tutScroller');
        inject( function ($compile, $rootScope, $templateCache) {
            _this.scope = $rootScope.$new();
            _this.scope.items = '0123456789'.split('');
            _this.scope.select = sinon.spy();

            $templateCache.put('item.html', '<div style="width: 100px;" class="item">{{item}}</div>');
            _this.html = '<div style="width:400px;" ' +
                'tut-scroller="items" ' +
                'tut-scroller-template="item.html" '+
                'tut-scroller-select="select(item)" ' +
                '></div>';
            _this.el = $compile(_this.html)(_this.scope);
            $rootScope.$digest();
        });
        done();
    });

    describe('DOM structure', function () {
        it('should set "tut-scroller" class on DOM element', function (done) {
            expect(this.el.hasClass('tut-scroller')).to.be.true;
            done();
        });

        it('should set position:relative on DOM element', function (done) {
            expect(this.el.css('position')).to.equal('relative');
            done();
        });

        it('should insert .window, a.move-left and a.move-right elements', function (done) {
            expect(this.el.children('.window').length).to.equal(1);
            expect(this.el.children('a.move-left').length).to.equal(1);
            expect(this.el.children('a.move-right').length).to.equal(1);
            done();
        });

        it('should wrap items content in .items and insert into .window', function (done) {
            var win             = this.el.children('.window');
            var itemsWrapper    = win.children('.items');
            var items           = itemsWrapper.children('.item');

            expect(itemsWrapper.length).to.equal(1);
            expect(items.length).to.equal(this.scope.items.length);

            done();
        });

        it('should add .hidden class to each item but the first 4', function (done) {
            var itemEls = this.el.find('.item');
            expect(itemEls.length).to.be.above(0);
            itemEls.each( function (i) {
                expect($(this).hasClass('hidden')).to.equal(i>3);
            });
            done();
        });
    });


    describe('scope', function () {
        beforeEach( function (done) {
            this.isolateScope = this.el.isolateScope();
            done();
        });

        it('should initialise .pos with the initial positions of elements', function (done) {
            var isolateScope = this.isolateScope;

            this.el.find('.item').each( function (i) {
                expect($(this).width()).to.be.above(0);
                expect(isolateScope.pos[i]).to.equal(i*100);
            });
            done();
        });

        it('should initialise .contentWidth', function (done) {
            expect(this.isolateScope.contentWidth).to.equal(1000);
            done();
        });

        it('should initialise .itemWidth', function (done) {
            expect(this.isolateScope.itemWidth).to.equal(100);
            done();
        });
    });


    describe('mouse events', function () {
        beforeEach( function (done) {
            var el = this.el.find('.items');

            this.isolateScope = this.el.isolateScope();

            this.triggerEvent = function triggerEvent (type, props) {
                var ev = $.Event(type, props);
                ev.stopPropagation = sinon.spy();
                ev.preventDefault = sinon.spy();
                el.trigger(ev);
                return ev;
            };

            done();
        });

        describe('mousedown', function () {
            it('should set scope.reference to ev.pageX', function (done) {
                this.isolateScope.reference = 0;

                this.triggerEvent('mousedown', {pageX: 200, which: 1});

                expect(this.isolateScope.reference).to.equal(200);

                done();
            });

            it('should work only for left button', function (done) {
                this.isolateScope.reference = 0;

                this.triggerEvent('mousedown', {pageX: 200, which: 2});

                expect(this.isolateScope.reference).to.equal(0);

                done();
            });

            it('should stop event', function (done) {
                this.isolateScope.reference = 0;
                var ev = this.triggerEvent('mousedown', {pageX: 200, which: 1});
                expect(ev.preventDefault).called;
                expect(ev.stopPropagation).called;
                done();
            });

            it('should set scope.maxShift to 0', function (done) {
                this.isolateScope.maxShift = 700;
                this.triggerEvent('mousedown', {pageX: 200, which: 1});
                expect(this.isolateScope.maxShift).to.equal(0);
                done();
            });

            it('should set scope.origin to ev.pageX', function (done) {
                this.isolateScope.origin = 600;
                this.triggerEvent('mousedown', {pageX: 200, which: 1});
                expect(this.isolateScope.origin).to.equal(200);
                done();
            });
        });


        describe('mouseup, mouseleave', function () {
            it('should set reference to null', function (done) {
                this.isolateScope.reference = 100;
                this.triggerEvent('mouseup', {pageX: 200});
                expect(this.isolateScope.reference).to.be.null;

                this.isolateScope.reference = 100;
                this.triggerEvent('mouseleave', {pageX: 200});
                expect(this.isolateScope.reference).to.be.null;

                done();
            });

            it('should stop event if scope.maxShift >= 0.05*itemWidth', function (done) {
                this.isolateScope.reference = 100;
                var ev = this.triggerEvent('mouseup', {pageX: 200});
                expect(ev.preventDefault).called;
                expect(ev.stopPropagation).called;
                done();
            });

            it('should move items to origin if the maxShift is below 5% of itemWidth', function (done) {
                var is = this.isolateScope;

                this.triggerEvent('mousedown', {pageX: 200, which: 1});
                this.triggerEvent('mousemove', {pageX: 202});
                this.triggerEvent('mousemove', {pageX: 204});
                this.triggerEvent('mouseup', {pageX: 204});

                this.el.find('.item').each( function (i) {
                    expect(is.pos[i]).to.equal(i*100);
                });

                done();
            });

            it('should call scope.select(ev.target) if the maxShift is below 5% of itemWidth', function (done) {
                var spy = this.scope.select;
                var ev, el;

                this.triggerEvent('mousedown', {pageX: 200, which: 1});
                this.triggerEvent('mousemove', {pageX: 202});
                this.triggerEvent('mousemove', {pageX: 204});

                expect(spy).not.called;

                el = this.el.find('.item').get(7);
                ev = this.triggerEvent('mouseup', {pageX: 204, target: el});

                expect(spy).calledOnce.and.calledWith(this.scope.items[7]);

                done();
            });
        });


        describe('mousemove', function () {
            it('should move reference to pageX', function (done) {
                this.isolateScope.reference = 100;
                this.triggerEvent('mousemove', {pageX: 200});
                expect(this.isolateScope.reference).to.equal(200);
                done();
            });

            it('should do nothing if scope.reference is null', function (done) {
                this.isolateScope.reference = null;
                this.triggerEvent('mousemove', {pageX: 200});

                expect(this.isolateScope.reference).to.be.null;

                done();
            });

            it('should shift items by ev.pageX - scope.reference [previous value]', function (done) {
                var isolateScope = this.isolateScope;
                isolateScope.reference = 100;
                this.triggerEvent('mousemove', {pageX: 90});

                this.el.find('.item').each( function (i) {
                    expect(isolateScope.pos[i]).to.equal(i*100 - 10);
                });

                done();
            });

            it('should stop event', function (done) {
                var isolateScope = this.isolateScope;
                isolateScope.reference = 100;

                var ev = this.triggerEvent('mousemove', {pageX: 90});

                expect(ev.preventDefault).called;
                expect(ev.stopPropagation).called;

                done();
            });

            it('should calculate the scope.maxShift', function (done) {
                this.isolateScope.reference = this.isolateScope.origin = 100;
                this.isolateScope.maxShift = 0;

                this.triggerEvent('mousemove', {pageX: 110});
                this.triggerEvent('mousemove', {pageX: 90});
                this.triggerEvent('mousemove', {pageX: 80});
                this.triggerEvent('mousemove', {pageX: 112});

                expect(this.isolateScope.maxShift).to.equal(20);

                done();
            });
        });
    });
});
