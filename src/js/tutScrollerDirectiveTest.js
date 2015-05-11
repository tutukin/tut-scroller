describe('tutScrollerDirective', function () {
    beforeEach( module('tutScroller') );

    beforeEach( function () {
        var _this = this;
        this.PM = { attachTo: sinon.stub() };

        this.SS = { Scroller: sinon.stub() };
        this.scroller = {
            setWindowWidth: sinon.spy(),
            scroll: sinon.spy(),
            addItem: sinon.spy(),
            scrollLeft: sinon.spy(),
            scrollRight: sinon.spy()
        };

        this.SS.Scroller.returns(this.scroller);

        this.$window = {
          addEventListener: sinon.stub()
        };

        module( function($provide) {
            $provide.value('PointerMovements', _this.PM);
            $provide.value('Scroller', _this.SS);
            $provide.value('$window', _this.$window);
        });
    });

    beforeEach(function () {
        var _this = this;


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
    });

    it('should attach element to the PointerMovements service', function () {
        expect(this.PM.attachTo, 'PM.attachTo()').calledOnce
            .and.calledWithExactly(sinon.match.object, {
                onclick:    sinon.match.func,
                onmove:     sinon.match.func,
                clickThreshold: sinon.match.number
            });
        expect(this.PM.attachTo.firstCall.args[0].html()).to.equal(this.el.find('.items').html());
    });

    describe('pointer movements', function () {
        beforeEach( function () {
            var options  = this.PM.attachTo.firstCall.args[1];
            this.onmove  = options.onmove;
            this.onclick = options.onclick;
        });

        it('should call scope.select when click is detected', function () {
            var spy = this.scope.select = sinon.spy();
            var target = this.el.find('.item:first-child');
            this.onclick(target);

            expect(spy, 'spy()').calledOnce
                .and.calledWithExactly(this.scope.items[0]);
        });

        it('should shift elements by the given distance when the move is detected', function () {
            this.onmove(-10);
            expect(this.scroller.scroll).calledOnce
                .and.calledWithExactly(-10);
        });
    });

    describe('DOM structure', function () {
        it('should set "tut-scroller" class on DOM element', function () {
            expect(this.el.hasClass('tut-scroller')).to.be.true;
        });

        it('should set position:relative on DOM element', function () {
            expect(this.el.css('position')).to.equal('relative');
        });

        it('should insert .window, a.move-left and a.move-right elements', function () {
            expect(this.el.children('.window').length).to.equal(1);
            expect(this.el.children('a.move-left').length).to.equal(1);
            expect(this.el.children('a.move-right').length).to.equal(1);
        });

        it('should wrap items content in .items and insert into .window', function () {
            var win             = this.el.children('.window');
            var itemsWrapper    = win.children('.items');
            var items           = itemsWrapper.children('.item');

            expect(itemsWrapper.length).to.equal(1);
            expect(items.length).to.equal(this.scope.items.length);
            expect(this.scroller.addItem).has.callCount(this.scope.items.length);
        });
    });



    describe('scroller', function () {
        it('should instantiate the scroller', function () {
            expect(this.SS.Scroller).calledOnce
                .and.calledWithNew
                .and.calledWithExactly({
                    windowWidth: sinon.match.number,
                    showItemAt:  sinon.match.func,
                    hideItem:    sinon.match.func,
                    getItemSize: sinon.match.func
                });
        });
    });


    describe('resze event', function() {
      it('should attach an event listener to "resize"', function () {
        expect(this.$window.addEventListener).calledOnce
          .and.calledWithExactly('resize', sinon.match.func);
      });

      describe('listener', function () {
        beforeEach( function () {
          this.listener = this.$window.addEventListener.firstCall.args[1];
          this.stub = sinon.stub(jQuery.fn, 'width');
        });

        afterEach( function () {
          this.stub.restore();
        })

        it('should update window width', function () {
          var width = 600;
          this.stub.returns(width);

          this.listener();

          expect(this.stub, 'viewport.width()').calledOnce;
          expect(this.scroller.setWindowWidth, 'scroller.setWindowWidth').calledOnce
            .and.calledWithExactly(width);
        });
      });
    });
});
