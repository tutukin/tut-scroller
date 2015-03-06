var chai = require('chai');
var cAP = require('chai-as-promised');
chai.use(cAP);

var expect = chai.expect;

describe('tut-scroller', function () {
    describe('giwen items come from rest service', function () {

        beforeEach(function () {
          browser.get('/rest.html');
          this.items = element.all(by.css('.item'));
        });

        it('should finally show the items', function () {
            var items = element.all(by.css('.item'));
            expect(items.count()).eventually.equals(10);
        });

    });
});
