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
