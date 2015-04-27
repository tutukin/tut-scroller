describe.only('tutScrollerDirective', function () {
    beforeEach( module('tutScroller') );

    beforeEach( function () {
        var _this = this;
        this.PM = { attachTo: sinon.stub() };
        module( function($provide) {
            $provide.value('PointerMovements', _this.PM);
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

            this.el.find('.item').each( function (i) {
                var item = $(this);
                var x = parseInt(item.css('left'), 10);
                var xe = i*100 - 10;
                if (xe < 400) {
                    expect(x).to.equal(xe);
                }
            });
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
        });

        it('should add .hidden class to each item but the first 4', function () {
            var itemEls = this.el.find('.item');
            expect(itemEls.length).to.be.above(0);
            itemEls.each( function (i) {
                expect($(this).hasClass('hidden')).to.equal(i>3);
            });
        });
    });


    describe('scope', function () {
        beforeEach( function () {
            this.isolateScope = this.el.isolateScope();
        });

        it('should initialise .pos with the initial positions of elements', function () {
            var isolateScope = this.isolateScope;

            this.el.find('.item').each( function (i) {
                expect($(this).width()).to.be.above(0);
                expect(isolateScope.pos[i]).to.equal(i*100);
            });
        });

        it('should initialise .contentWidth', function () {
            expect(this.isolateScope.contentWidth).to.equal(1000);
        });

        it('should initialise .itemWidth', function () {
            expect(this.isolateScope.itemWidth).to.equal(100);
        });
    });
});
