angular.module('tutScroller', []);

angular.module('tutScroller').directive('tutScroller',
['$compile', '$templateCache', '$window', 'PointerMovements', 'Scroller',
function ($compile, $templateCache, $window, PM, Scroller) {
    var defaultTemplateHtml = '<div class="item">{{item}}</div>';

    function link (scope, iElement, iAttrs, controller, transcludeFn) {
        var wrapper = iElement.find('.items');
        var viewport = iElement.find('.window');

        var scroller = new Scroller.Scroller({
            windowWidth:    viewport.width(),
            getItemSize:    getItemSize,
            showItemAt:     showItemAt,
            hideItem:       hideItem
        });

        var itemTemplate = iAttrs.tutScrollerTemplate ?
            $templateCache.get(iAttrs.tutScrollerTemplate) :
            defaultTemplateHtml;

        iElement.addClass('tut-scroller');
        iElement.css('position', 'relative');

        scope.$watch('items', function (a, b) {
            _linkItems();
        });

        $window.addEventListener('resize', function () {
          // FIXME: check if windowWidth has changed
          // FIXME: use requestAnimationFrame to defer DOM manipulations
          var w = viewport.width();
          scroller.setWindowWidth(w);
        });

        var pointer = PM.attachTo(wrapper, {
            clickThreshold: Math.floor(0.05 * scope.itemWidth) || 8, // Fixme: scope.itemWidth is not available right now
            onmove: function _shift (s) { scroller.scroll(s); },
            onclick:selectItem
        });

        function selectItem (target) {
            var item = angular.element(target).scope().item;

            scope.selectItem({
                item : item
            });
        }

        iElement.find('a.move-left').on('click', function (ev) {
            var w = scroller.getMeanItemWidth();
            pointer.autoscroll(-w, Date.now());
        });

        iElement.find('a.move-right').on('click', function (ev) {
            var w = scroller.getMeanItemWidth();
            pointer.autoscroll(w, Date.now());
        });

        function _linkItems () {
            var collection = scope.items || [];

            angular.forEach(collection, function (item, i) {
                var el = _getItemTemplate(item, i);
                el.addClass('item');
                wrapper.append(el);
                scroller.addItem(el);
            });
        }

        function _getItemTemplate (item, index) {
            var itemScope = scope.$new(true);
            itemScope.item = item;
            itemScope.index = index;

            var el = $compile(itemTemplate)(itemScope);

            return el;
        }
    }


    function hideItem (el) {
        if ( ! el.hasClass('hidden') ) {
            el.addClass('hidden');
        }
    }

    function showItemAt (left, el) {
        el.removeClass('hidden');
        el.css('left', '' + left + 'px');
    }

    function getItemSize (el) {
        return el.width();
    }




    return {
        restrict:   'A',
        link:       link,
        scope:      {
            items:      '=tutScroller',
            selectItem: '&tutScrollerSelect'
        },
        template:
            '<div class="window">' +
                '<div class="items"></div>' +
            '</div>' +
            '<a href="#" class="move-right"><span class="icon"></span></a>' +
            '<a href="#" class="move-left"><span class="icon"></span></a>'
    };
}]);

angular.module('tutScroller').factory('PointerMovements', [
    '$window',
    function ($window) {

    function attachTo (target, options) {
        var service = new this.Movements(options);

        if ( typeof $window.ontouchstart !== 'undefined' ) {
            target.on('touchstart', tap);
            target.on('touchmove', move);
            target.on('touchend', release);
        }

        target.on('mousedown', tap);
        target.on('mousemove', move);
        target.on('mouseup', release);
        target.on('mouseleave',release);

        return service;

        function tap (ev) {
            return service.tap(ev);
        }

        function move (ev) {
            return service.move(ev);
        }

        function release (ev) {
            return service.release(ev);
        }
    }

    function Movements (options) {
        this.onclick = options.onclick || nop;
        this.onmove = options.onmove || nop;
        this.clickThreshold = options.clickThreshold || 0;

        this._cleanState();
    }

    function nop () {}





    var p = Movements.prototype;



    p._cleanState = function _cleanState () {
        this._state = {
            maxShift:   0,
            velocity:   0,
            timestamp:  null,
            reference:  null,
            origin:     null
        };
    };



    p.getX = function getX (ev) {
        touches = ev.targetTouches ?
            ev.targetTouches :
            ev.originalEvent ?
                ev.originalEvent.targetTouches :
                null;

        if ( touches && touches.length > 0 ) {
            return touches[0].clientX;
        }
        return ev.pageX;
    };



    p.isEventRelevant = function isEventRelevant (ev) {
        if ( ev === null || typeof ev !== 'object') return false;

        if ( ev.type.substr(0,5) === 'mouse' ) {
            return ev.which === 1;
        }

        return true;
    };




    p.getMaxShift = function getMaxShift () {
        return this._state.maxShift;
    };

    p.getReference = function getReference () {
        return this._state.reference;
    };

    p.getOrigin = function getOrigin () {
        return this._state.origin;
    };

    p.getVelocity = function getVelocity () {
        return this._state.velocity;
    };



    p.tap = function tap (ev) {
        if ( ! this.isEventRelevant(ev) ) {
            return;
        }

        this._state.origin = this._state.reference = this.getX(ev);
        this._state.maxShift = 0;

        this._state.timestamp = Date.now();

        return _stopEvent(ev);
    };



    p.move = function move (ev) {
        if ( typeof this._state.reference !== 'number' ) {
            return;
        }

        var x = this.getX(ev);
        var dist = x - this._state.reference;
        if ( typeof this.onmove === 'function' ) {
            this.onmove(dist);
        }

        var shift = Math.abs(x - this._state.origin);
        this._state.maxShift = shift > this._state.maxShift ?
            shift : this._state.maxShift;

        var timestamp = Date.now();
        var v = 1000*dist / (1 + timestamp - this._state.timestamp);
        this._state.velocity = 0.8*v + 0.2*this._state.velocity;
        this._state.timestamp = timestamp;

        this._state.reference = x;

        return _stopEvent(ev);
    }



    p.release = function release (ev) {
        var v;
        if ( this._state.maxShift < this.clickThreshold ) {
            if ( typeof this.onmove === 'function' ) {
                this.onmove(this._state.origin - this._state.reference);
            }

            if ( ev.type === 'mouseup' && typeof this.onclick === 'function' ) {
                this.onclick(ev.target);
            }
        }
        else {
            v = this.getVelocity();
            if ( v > 10 || v < -10 ) {
                this.autoscroll(0.8*v, this._state.timestamp);
            }
        }

        this._cleanState();
        return _stopEvent(ev);
    }


    p.autoscroll = function autoscroll (amplitude, t0, prevShift) {
        var _this = this;
        var shift = 0;
        var delta = 0;

        if ( typeof prevShift === 'number' ) {
            shift = this.autoshift(amplitude, t0);
            delta = Math.abs(shift - amplitude);

            if ( delta < 0.5 ) {
                this.onmove(amplitude-prevShift);
                return;
            }

            this.onmove(shift - prevShift);
        }

        $window.requestAnimationFrame( function () {
            _this.autoscroll(amplitude, t0, shift);
        });
    };

    p.autoshift = function autoshift (amplitude, t0) {
        var tau = ( t0 - Date.now() ) / 325.0;
        var d = 1.0 - Math.exp(tau);
        return amplitude * d;
    };


    function _stopEvent (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }


    return {
        attachTo:  attachTo,
        Movements: Movements
    };
}]);

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

    p.setWindowWidth = function setWindowWidth (width) {
      this._windowWidth = width;
      this.scroll(0);
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

//# sourceMappingURL=tut-scroller.js.map