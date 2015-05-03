var chai = require('chai');
var cAP = require('chai-as-promised');
chai.use(cAP);

var expect = chai.expect;

describe('tut-scroller', function () {
  beforeEach(function () {
      browser.manage().window().setSize(800, 600);
      browser.get('/resize.html');
      this.items = element.all(by.css('.item'));
      expect(this.items.count()).eventually.equals(10);
  });

  it('should hide all items but the first four', function () {
      this.items.each( function (el, i) {
          var msg = '' + i + '-th item';
          expect( el.isDisplayed(), msg ).eventually.to.equal(i<4);
      });
  });

  describe('given the window is resized to 1000px', function () {
     beforeEach(function () {
         browser.manage().window().setSize(1000, 600);
     });

     it('should show the first 5 items', function () {
         browser.sleep(1000);
         this.items.each( function (el, i) {
             var msg = '' + i + '-th item';
             expect( el.isDisplayed(), msg ).eventually.to.equal(i<5);
         });
     });
  });
});
