angular.module('tutScroller').directive('tutScroller',
['$compile', '$templateCache',
function ($compile, $templateCache) {
    var defaultTemplateHtml = '<div class="item">{{item}}</div>';
    var templateId;
    var itemTemplate;

    function compile (tElement, tAttrs) {
        templateId = tAttrs.tutScrollerTemplate || null;
        return link;
    }

    function link (scope, iElement, iAttrs, controller, transcludeFn) {
        var wrapper = iElement.find('.items');
        var collection = scope[iAttrs.tutScroller] || [];

        iElement.addClass('tut-scroller');
        iElement.css('position', 'relative');

        //scope.windowWidth = wrapper.width();
        // todo: calculate it!
        scope.windowWidth = 400;
        scope.contentWidth = 0;
        scope.currentShift = 0;

        angular.forEach(collection, function (item, i) {
            var el = _getItemTemplate(scope, item, i);
            scope.pos[i] = scope.contentWidth;
            if ( scope.pos[i] >= scope.windowWidth ) {
                _hide(el);
            }
            else {
                _showAt(el, scope.getX(i));
            }
            // FIXME: .width() comes from jQuery. Use .css()
            // FIXME: note, jqLite.css supports INLINE styles only!!!
            scope.contentWidth += el.width();
            wrapper.append(el);
        });

        scope.itemWidth = Math.floor(scope.contentWidth / collection.length);

        wrapper.on('mousedown', function (ev) {
            if ( ev.which !== 1 ) {
                return;
            }

            scope.origin = scope.reference = ev.pageX;
            scope.maxShift = 0;

            return _stopEvent(ev);
        });

        wrapper.on('mouseup', function (ev) {
            return _release(iElement, scope, ev);
        });

        wrapper.on('mouseleave', function (ev) {
            return _release(iElement, scope, ev);
        });

        wrapper.on('mousemove', function (ev) {
            var s;

            if ( scope.reference === null ) {
                return;
            }

            _shift(iElement, scope, ev.pageX - scope.reference);
            scope.reference = ev.pageX;

            s = Math.abs(scope.reference - scope.origin);
            scope.maxShift = s > scope.maxShift ?
                s : scope.maxShift;

            return _stopEvent(ev);
        });

        iElement.find('a.move-left').on('click', function (ev) {
            _shift(iElement, scope, -scope.itemWidth);
        });

        iElement.find('a.move-right').on('click', function (ev) {
            _shift(iElement, scope, scope.itemWidth);
        });
    }


    function _stopEvent (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        return false;
    }

    function _release(iElement, scope, ev) {
        if ( scope.reference === null ) {
            return;
        }
        if ( scope.maxShift < Math.floor(0.05 * scope.itemWidth) ) {
            _shift(iElement, scope, scope.origin - scope.reference );
            if ( ev.type === 'mouseup' ) {
                scope.selectItem({
                    item : _getItemByElement(scope, ev.target)
                });
            }
        }
        scope.reference = null;
        return _stopEvent(ev);
    }

    function _getItemByElement (scope, el) {
        var s = angular.element(el).scope();
        return s.item;
    }




    function _getItemTemplate (scope, item, index) {
        var html = typeof templateId === 'string' ?
            $templateCache.get(templateId) : defaultTemplateHtml;

        var itemScope = scope.$new(true);
        itemScope.item = item;
        itemScope.index = index;

        var el = $compile(html)(itemScope);

        return el;
    }


    function _hide (el) {
        if ( ! el.hasClass('hidden') ) {
            el.addClass('hidden');
        }
    }

    function _showAt (el, left) {
        el.removeClass('hidden');
        el.css('left', '' + left + 'px');
    }

    function _shift (iElement, scope, s) {
        iElement.find('.item').each( function (i) {
            var el = $(this);
            var left = scope.pos[i] = scope.translate(scope.pos[i] + s);
            if ( left >= scope.windowWidth ) {
                _hide(el);
            }
            else {
                _showAt(el, left);
            }
        });
    }



    return {
        restrict:   'A',
        compile:    compile,
        scope:      {
            items:      '=tutScroller',
            selectItem: '&tutScrollerSelect'
        },
        controller: 'tutScrollerController',
        template:
            '<div class="window">' +
                '<div class="items"></div>' +
            '</div>' +
            '<a href="#" class="move-right"></a>' +
            '<a href="#" class="move-left"></a>'
    };
}]);
