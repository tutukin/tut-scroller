var chai = require('chai');
var cAP = require('chai-as-promised');
chai.use(cAP);

var expect = chai.expect;

describe('tut-scroller', function () {
  beforeEach(function () {
    browser.get('/test.html');
    this.items = element.all(by.css('.item'));
    expect(this.items.count()).eventually.equals(10);
  });

  it('should hide all items but the first four', function () {
      this.items.each( function (el, i) {
          expect( el.isDisplayed() ).eventually.to.equal(i<4);
      });
  });

  it('should properly position the first four elements', function () {
      var items = this.items;
      var d = 100;
      var i = 0;
      var l = 4;

      element(by.css('.items')).getLocation()
      .then(function (loc) {
          for ( ; i < l; i++ ) {
              el = items.get(i);
              expect( el.getLocation() ).eventually
                .to.have.property('x').that.equals(loc.x + i*d);
          }
      });
  });

  it('should move items left when user press a.move-left', function () {
      var moveLeft = element( by.css('a.move-left') );
      var _this = this;

      expect(moveLeft).eventually.to.exist;

      moveLeft.click();
      browser.sleep(1500);

      element(by.css('.items')).getLocation()
      .then(function (loc) {
          var i;
          for ( i = 1; i < 5; i++ ) {
              el = _this.items.get(i);
              expect( el.getLocation() ).eventually
                .to.have.property('x').that.equals(loc.x + (i-1)*100);
          }
      });
  });

  it('should move items right when user press a.move-right', function () {
      var moveRight = element( by.css('a.move-right') );
      var _this = this;

      expect(moveRight).eventually.to.exist;

      moveRight.click();
      browser.sleep(1500);

      element(by.css('.items')).getLocation()
      .then(function (loc) {
          var i;

          for ( i = 0; i < 3; i++ ) {
              el = _this.items.get(i);
              expect( el.getLocation() ).eventually
                .to.have.property('x').that.equals(loc.x + (i+1)*100);
          }

          expect( _this.items.get(9).getLocation() ).eventually
            .to.have.property('x').that.equals(loc.x);
      });

  });


  xit('should move items with mouse', function () {
      var itemsContainer = element( by.css('.items') );
      var items = this.items;

      browser.actions()
        .mouseMove(itemsContainer, {x:50, y:0})
        .mouseDown()
        .mouseMove(itemsContainer, {x:0, y:0})
        .mouseUp()
        .perform();

      itemsContainer.getLocation().then( function (loc) {
          var i;
          for ( i = 0; i < 5; i++ ) {
              expect( items.get(i).getLocation() ).eventually
                .to.have.property('x').that.equals(i*100 - 50 + loc.x);
          }
      });

  });
});
