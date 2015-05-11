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

            // TODO: This mouseleave check looks a bit ugly! Should not it be treated separately?
            if ( ev.type !== 'mouseleave' && typeof this.onclick === 'function' ) {
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
