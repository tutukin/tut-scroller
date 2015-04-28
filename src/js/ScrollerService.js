angular.module('tutScroller').factory('Scroller', function () {
    function Scroller( options ) {
        var _this = this;
        this._windowWidth = options.windowWidth || 400;
        this._contentWidth = 0;
        this._items = [];

        ['showItemAt', 'hideItem', 'getItemSize'].forEach(function (method) {
            if ( typeof options[method] !== 'function' ) {
                _this[method] = nop;
            }
            _this[method] = options[method]
        });
    }

    var p = Scroller.prototype;

    p.getWindowWidth = function getWindowWidth () {
        return this._windowWidth;
    };

    p.getContentWidth = function getContentWidth () {
        return this._contentWidth;
    };

    p.getMeanItemWidth = function getMeanItemWidth () {
        var count = this._items.length;
        return count === 0 ?
            0 :
            Math.ceil( this._contentWidth / count );
    };



    p.addItem = function addItem (el) {
        var item = {
            width:  this.getItemSize(el) || 0,
            pos:    this._contentWidth,
            el:     el
        };

        this._items.push(item);
        this._contentWidth += item.width;

        this._adjustItemVisibility(item);
    };


    p.scroll = function scroll (shift) {
        var l = this._items.length;
        var windowWidth = this.getWindowWidth();
        var i, item, pos;

        for ( i = 0; i < l; i++ ) {
            item = this._items[i];
            item.pos = this._translate(item.pos+shift, item.width);
            this._adjustItemVisibility(item);
        }
    };

    p.scrollLeft = function scrollLeft () {
        var mw = this.getMeanItemWidth();
        return this.scroll(-mw);
    };

    p.scrollRight = function scrollRight () {
        var mw = this.getMeanItemWidth();
        return this.scroll(mw);
    };





    p._adjustItemVisibility = function _adjustItemVisibility (item) {
        if ( item.pos >= this._windowWidth ) {
            this.hideItem(item.el);
        }
        else {
            this.showItemAt(item.pos, item.el);
        }
    };


    p._translate = function _translate (pos, size) {
        var contentWidth = this.getContentWidth();
        var left = pos % contentWidth;
        var right = left + size;

        if ( left <= -size ) {
            left += contentWidth;
        }

        if ( left < contentWidth && right > contentWidth ) {
            left -= contentWidth;
        }

        return left;
    };

    return {
        Scroller:   Scroller
    };

    function nop () {}
});
