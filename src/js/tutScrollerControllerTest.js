describe('tutScrollerController', function () {
    beforeEach( function (done) {
        var _this = this;

        module('tutScroller');

        inject( function ($rootScope, $controller) {
            _this.scope = {};

            _this.controller = $controller('tutScrollerController', {
                $scope: _this.scope
            });

        });
        done();
    });

    it('should initialise scope.shift as 0', function (done) {
        expect(this.scope.shift).to.equal(0);
        done();
    });

    it('should initialise .pos array', function (done) {
        expect(this.scope.pos).to.be.instanceof(Array);
        done();
    });

    it('should set .reference to null', function (done) {
        expect(this.scope.reference).to.be.null;
        done();
    });


    describe('.getX(n)', function () {
        it('should be a function', function (done) {
            expect(this.scope.getX).to.be.a('function');
            done();
        });

        it('should return scope.pos[n] + scope.shift', function (done) {
            var scope = this.scope;

            scope.pos = [100, 112, 114, 177, 288];
            scope.shift = -14;

            scope.pos.forEach( function (pos, n) {
                var res = scope.getX(n);
                expect(res).to.equal(pos+scope.shift);
            });

            done();
        });
    });


    describe('.translate(s)', function () {
        it('should be a function', function (done) {
            expect(this.scope.translate).to.be.a('function');
            done();
        });

        it('should return the sum of scope.shift and argiment if it is less than scope.itemWidth', function (done) {
            this.scope.itemWidth = 100;
            this.scope.contentWidth = 1000;

            expect(this.scope.translate(-99)).to.equal(-99);

            done();
        });

        it('should map argument to (-scope.itemWidth, scope.contentLength-scope.itemWidth]', function (done) {
            var scope = this.scope;

            scope.contentWidth = 6;
            scope.itemWidth = 2

            expect(scope.translate(-2)).to.equal(4);
            expect(scope.translate(-(2+612))).to.equal(4); // 612 = contentWidth * 12
            expect(scope.translate(5)).to.equal(5);
            expect(scope.translate(5+612)).to.equal(5);

            done();
        });
    });
});
