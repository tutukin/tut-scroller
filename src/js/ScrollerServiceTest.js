describe('ScrollerService', function () {
    beforeEach(module('tutScroller'));

    beforeEach( function () {
        var _this = this;

        inject( function ($injector) {
            _this.SS = $injector.get('Scroller');
        });
    });

    it('should exist', function () {
        expect(this.SS).to.exist;
    });


    describe('.Scroller(options)', function () {
        beforeEach( function () {
            this.windowWidth = 400;

            this.showItemAt = sinon.spy();
            this.hideItem   = sinon.spy();
            this.getItemSize= sinon.stub();

            this.scroller = new this.SS.Scroller({
                windowWidth:    this.windowWidth,
                showItemAt:     this.showItemAt,
                hideItem:       this.hideItem,
                getItemSize:    this.getItemSize
            });
        });

        it('should be a static member of the service', function () {
            expect(this.SS).itself.to.respondTo('Scroller');
        });

        describe('#showItemAt(pos, item)', function () {
            it('should be a function that equals to options.showItemAt', function () {
                expect(this.scroller.showItemAt).to
                    .be.a('function')
                    .that.equals(this.showItemAt);
            });
        });

        describe('#hideItem(el)', function () {
            it('should be a function that equals options.hideItem', function () {
                expect(this.scroller.hideItem).to
                    .be.a('function')
                    .that.equals(this.hideItem);
            });
        });

        describe('#getItemSize(el)', function () {
            it('should be a function that equals options.getItemSize', function () {
                expect(this.scroller.getItemSize).to
                    .be.a('function')
                    .that.equals(this.getItemSize);
            });
        });

        describe('#getWindowWidth()', function () {
            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('getWindowWidth');
            });

            it('should return the value passed in options', function () {
                var w = this.scroller.getWindowWidth();
                expect(w).equals(this.windowWidth);
            });
        });

        describe('#getContentWidth()', function () {
            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('getContentWidth');
            });

            it('should return 0 if no items added', function () {
                var w = this.scroller.getContentWidth();
                expect(w).equals(0);
            });
        });

        describe('#getMeanItemWidth()', function () {
            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('getMeanItemWidth');
            });

            it('should return 0 by default', function () {
                var w = this.scroller.getMeanItemWidth();
                expect(w).equals(0);
            });
        });

        describe('#addItem(el)', function () {
            beforeEach( function () {
                this.el = {an: 'element'};
            });

            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('addItem');
            });

            it('should increase contentWidth by element\'s width', function () {
                var width = 100;
                this.getItemSize.withArgs(this.el).returns(width);

                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);

                var w = this.scroller.getContentWidth();

                expect(w).to.equal(2*width);
            });

            it('should show item if it fits to window', function () {
                var width = Math.ceil(this.windowWidth / 2);
                this.getItemSize.withArgs(this.el).returns(width);

                this.scroller.addItem(this.el);

                expect(this.scroller.showItemAt).calledOnce
                    .and.calledWithExactly(0, this.el);
            });

            it('should show next item shifted by the width of the previous items', function () {
                var width = Math.ceil(this.windowWidth / 4);
                this.getItemSize.withArgs(this.el).returns(width);

                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);

                expect(this.showItemAt, 'showItemAt()').calledThrice
                    .and.calledWithExactly(0, this.el)
                    .and.calledWithExactly(width, this.el)
                    .and.calledWithExactly(2*width, this.el);
            });

            it('should hide items that are beyound the window', function () {
                var width = this.windowWidth + 1;
                this.getItemSize.withArgs(this.el).returns(width);

                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);

                expect(this.showItemAt, 'showItemAt()').calledOnce
                    .and.calledWithExactly(0, this.el);
                expect(this.hideItem, 'hideItem()').calledOnce
                    .and.calledWithExactly(this.el);
            });

            it('should update mean item width', function () {
                this.getItemSize.onCall(0).returns(110);
                this.getItemSize.onCall(1).returns(130);
                this.getItemSize.onCall(2).returns(140);

                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);
                this.scroller.addItem(this.el);
                var w = this.scroller.getMeanItemWidth();

                expect(w).equals(127);
            });
        });



        describe('#_translate(pos, size)', function () {
            beforeEach( function () {
                this.getItemSize.returns(100);
                var scroller = this.scroller;
                [1,2,3,4,5,6,7,8,9,0].forEach(function() {scroller.addItem({});});
            });

            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('_translate');
            });

            it('should return pos if item is within the window', function () {
                var pos = this.scroller._translate(100,100);
                expect(pos).to.equal(100);
            });

            it('should translate position to the end of content if item is behind the left window border', function () {
                var pos = this.scroller._translate(-100,100);
                expect(pos).to.equal(this.scroller.getContentWidth()-100);
            });

            it('should translate item that exceeds the contentWidth to the beginning of content', function () {
                var cw = this.scroller.getContentWidth();
                var left = cw - 50;
                var pos = this.scroller._translate(left,100);
                expect(pos).to.equal(left-cw);
            });
        });

        describe('#scroll(shift)', function () {
            beforeEach( function () {
                var scroller = this.scroller;

                this.itemSize = 100;
                this.getItemSize.returns(this.itemSize);

                this.items = [0,1,2,3,4,5,6,7,8,9].map( function (i) {
                    var item = {an: 'item', _id: i};
                    scroller.addItem(item);
                    return item;
                });

                this.showItemAt.reset();
                this.hideItem.reset();
            });

            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('scroll');
            });

            it('should show every item at the translated position', function () {
                this.scroller._translate = sinon.stub().returns(110);

                this.scroller.scroll(10);

                expect(this.scroller._translate).has.callCount(this.items.length);
                expect(this.showItemAt).has.callCount(this.items.length)
                    .and.always.calledWith(110);
                    expect(this.hideItem).not.called;
            });

            it('should hide every item that is behind window borders', function () {
                var ww = this.scroller.getWindowWidth();
                this.scroller._translate = sinon.stub().returns(ww+1);

                this.scroller.scroll(10);

                expect(this.showItemAt).not.called;
                expect(this.hideItem).has.callCount(this.items.length);
            });
        });

        describe('#scrollLeft()', function () {
            beforeEach( function () {
                var scroller = this.scroller;
                this.itemSize = 100;
                this.getItemSize.returns(this.itemSize);

                this.items = [0,1,2,3,4,5,6,7,8,9].map( function (i) {
                    var item = {an: 'item', _id: i};
                    scroller.addItem(item);
                    return item;
                });

                this.scroller.scroll = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('scrollLeft');
            });

            it('should call #scroll with negative mean width', function () {
                var mw = this.scroller.getMeanItemWidth();

                this.scroller.scrollLeft();

                expect(this.scroller.scroll, 'scroller.scroll()').calledOnce
                    .and.calledWithExactly(-mw);
            });
        });

        describe('#scrollRight()', function () {
            beforeEach( function () {
                var scroller = this.scroller;
                this.itemSize = 100;
                this.getItemSize.returns(this.itemSize);

                this.items = [0,1,2,3,4,5,6,7,8,9].map( function (i) {
                    var item = {an: 'item', _id: i};
                    scroller.addItem(item);
                    return item;
                });

                this.scroller.scroll = sinon.spy();
            });

            it('should be an instance method', function () {
                expect(this.SS.Scroller).to.respondTo('scrollRight');
            });

            it('should call #scroll with negative mean width', function () {
                var mw = this.scroller.getMeanItemWidth();

                this.scroller.scrollRight();

                expect(this.scroller.scroll, 'scroller.scroll()').calledOnce
                    .and.calledWithExactly(mw);
            });
        });
    });

});
