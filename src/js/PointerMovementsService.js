angular.module('tutScroller').factory('PointerMovements', [
    '$window',
    function ($window) {

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
            velocity:   0,
            timestamp:  null,
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

    p.getVelocity = function getVelocity () {
        return this._state.velocity;
    };



    p.tap = function tap (ev) {
        if ( ! ev || ! ev.which || ev.which !== 1 ) {
            return;
        }

        this._state.origin = this._state.reference = ev.pageX;
        this._state.maxShift = 0;

        this._state.timestamp = Date.now();

        return _stopEvent(ev);
    };



    p.move = function move (ev) {
        if ( typeof this._state.reference !== 'number' ) {
            return;
        }

        var dist = ev.pageX - this._state.reference;
        if ( typeof this.onmove === 'function' ) {
            this.onmove(dist);
        }

        var shift = Math.abs(ev.pageX - this._state.origin);
        this._state.maxShift = shift > this._state.maxShift ?
            shift : this._state.maxShift;

        var timestamp = Date.now();
        var v = 1000*dist / (1 + timestamp - this._state.timestamp);
        this._state.velocity = 0.8*v + 0.2*this._state.velocity;
        this._state.timestamp = timestamp;

        this._state.reference = ev.pageX;

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
