var chai = require('chai');
var cAP = require('chai-as-promised');
chai.use(cAP);

var expect = chai.expect;

describe.only('tut-scroller', function () {
    beforeEach(function () {
      browser.get('/test.html');
      this.items = element.all(by.css('.item'));
      expect(this.items.count()).eventually.equals(10);
    });

    it('should inertially move items after mouse releases control', function () {
        var itemsContainer = element( by.css('.items') );
        var items = this.items;

        browser.actions()
          .mouseMove(itemsContainer, {x:50, y:0})
          .mouseDown()
          .mouseMove(itemsContainer, {x:60, y:0})
          .mouseUp()
          .perform();

        itemsContainer.getLocation().then( function (loc) {
            var i, x;

            for ( i = 0; i < items.length; i++ ) {
                items.get(i).getLocation().then( function (loc) {
                    if (loc.x >= 400 || loc.x <= -100 ) {
                        expect( items.get(i).isDisplayed() ).eventually.to.be.false;
                    }
                    else {
                        expect(loc.x).to.be.above(i*100 + 10 + loc.x);
                    }
                })

            }
        });

    });
});
