angular.module('tutScroller').factory('PointerMovements', function () {

    function attachTo (target, options) {
        var service = new this.Movements(options);

        target.on('mousedown', function (ev) {
            return service.tap(ev);
        });

        target.on('mousemove', function (ev) {
            return service.move(ev);
        });

        target.on('mouseup', function (ev) {
            return service.release(ev);
        });

        target.on('mouseleave', function (ev) {
            return service.release(ev);
        });

        return service;
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
            reference:  null,
            origin:     null
        };
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



    p.tap = function tap (ev) {
        if ( ! ev || ! ev.which || ev.which !== 1 ) {
            return;
        }

        this._state.origin = this._state.reference = ev.pageX;
        this._state.maxShift = 0;

        return _stopEvent(ev);
    };



    p.move = function move (ev) {
        if ( typeof this._state.reference !== 'number' ) {
            return;
        }

        if ( typeof this.onmove === 'function' ) {
            this.onmove(ev.pageX - this._state.reference);
        }

        var shift = Math.abs(ev.pageX - this._state.origin);
        this._state.maxShift = shift > this._state.maxShift ?
            shift : this._state.maxShift;

        this._state.reference = ev.pageX;

        return _stopEvent(ev);
    }



    p.release = function release (ev) {
        if ( this._state.maxShift < this.clickThreshold ) {
            if ( typeof this.onmove === 'function' ) {
                this.onmove(this._state.origin - this._state.reference);
            }

            if ( ev.type === 'mouseup' && typeof this.onclick === 'function' ) {
                this.onclick(ev.target);
            }
        }

        this._cleanState();
        return _stopEvent(ev);
    }



    function _stopEvent (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }


/*
    return {
        tap:    tap,
        move:   move,
        release:release,
        _state: {

        }
    };
    */

    return {
        attachTo:  attachTo,
        Movements: Movements
    };
});
