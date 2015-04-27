angular.module('tutScroller').directive('tutScroller',
['$compile', '$templateCache', 'PointerMovements',
function ($compile, $templateCache, PM) {
    var defaultTemplateHtml = '<div class="item">{{item}}</div>';
    var templateId;
    var itemTemplate;

    function link (scope, iElement, iAttrs, controller, transcludeFn) {
        templateId = iAttrs.tutScrollerTemplate || null;
        var wrapper = iElement.find('.items');
        var window = iElement.find('.window');

        iElement.addClass('tut-scroller');
        iElement.css('position', 'relative');

        // FIXME: jQuery dep: .width()
        // default - to make unit tests work
        scope.windowWidth = window.width() || 400;
        scope.contentWidth = 0;
        scope.currentShift = 0;

        scope.$watch('items', function (a, b) {
            _linkItems(scope, wrapper);
        });

        PM.attachTo(wrapper, {
            clickThreshold: Math.floor(0.05 * scope.itemWidth) || 8, // Fixme: scope.itemWidth is not available right now
            onmove: _shift,
            onclick:selectItem
        });

        function _shift (s) {
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

        function selectItem (target) {
            var item = angular.element(target).scope().item;

            scope.selectItem({
                item : item
            });
        }

        iElement.find('a.move-left').on('click', function (ev) {
            _shift(-scope.itemWidth);
        });

        iElement.find('a.move-right').on('click', function (ev) {
            _shift(scope.itemWidth);
        });
    }


    function _linkItems (scope, wrapper) {
        var collection = scope.items || [];

        angular.forEach(collection, function (item, i) {
            var el = _getItemTemplate(scope, item, i);
            el.addClass('item');
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




    return {
        restrict:   'A',
        link:       link,
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
