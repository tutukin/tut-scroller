angular.module('tutScroller').factory('PointerMovements', [
    '$window', '$document', '$timeout',
    function ($window, $document, $timeout) {

        var WHEEL_TIMEOUT = 50;
        var WHEEL_DELTA = 1;

    function attachTo (target, options) {
        var service = new this.Movements(options);

        $window.addEventListener('resize', function () {
            service.resize();
        });

        if ( typeof $window.ontouchstart !== 'undefined' ) {
            target.on('touchstart', tap);
            target.on('touchmove', move);
            target.on('touchend', release);
        }

        target.on('mousedown', tap);
        target.on('mousemove', move);
        target.on('mouseup', release);
        target.on('mouseleave',release);

        var wheelEvName =
            'onwheel' in $document[0] ?
                'wheel' :
            'onmousewheel' in $document[0] ?
                'mousewheel' : 'MozMousePixelScroll';

        target.on(wheelEvName, wheel);

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

        function wheel (ev) {
            return service.wheel(ev);
        }
    }

    function Movements (options) {
        this.onclick = options.onclick || nop;
        this.onmove = options.onmove || nop;
        this.onresize = options.onresize || nop;
        this.clickThreshold = options.clickThreshold || 0;
        this.mode = options.mode || 'x';

        this._cleanState();
    }

    function nop () {}





    var p = Movements.prototype;



    p._cleanState = function _cleanState () {
        this._state = {
            maxShift:   [0, 0],
            velocity:   [0, 0],
            timestamp:  null,
            reference:  null,
            origin:     null,
            scroll:     [0, 0],
            wheelTimer: null,
            throttle:   false
        };
    };


    // FIXME: use Clock.throttle
    // FIXME: maybe all the event attachments should go to a directive
    p.throttle = function throttle () {
        var state = this._state;
        state.throttle = true;
        $window.requestAnimationFrame( function () {
            state.throttle = false;
        });
    };



    p.resize = function resize () {
        if ( this._state.throttle ) return;

        if ( typeof this.onresize === 'function' ) {
            this.throttle();
            this.onresize();
        }
    };


    p.getXY = function getXY (ev) {
        touches = ev.targetTouches ?
            ev.targetTouches :
            ev.originalEvent ?
                ev.originalEvent.targetTouches :
                null;

        if ( touches && touches.length > 0 ) {
            return [touches[0].clientX, touches[0].clientY];
        }

        var ref = getEventRef(ev);

        return [ref.pageX, ref.pageY];
    };

    function getEventRef (ev) {
        return ref =
            typeof ev.originalEvent === 'object' ?
                ev.originalEvent :
                ev;
    }

    p.getDeltaXY = function getDeltaXY (ev) {
        var ref = getEventRef(ev);
        return [ref.deltaX || 0, ref.deltaY || 0];
    };




    p.isEventRelevant = function isEventRelevant (ev) {
        var value;
        if ( ev === null || typeof ev !== 'object') return false;

        if ( ev.type.match(/wheel/) || ev.type === 'MozMousePixelScroll' ) {
            value = this.getDeltaXY(ev);
            return !vIsZero(value);
        }

        if ( ev.type.substr(0,5) === 'mouse' ) {
            return ev.which === 1;
        }

        return true;
    };

    function arrCopy (x) {
        return x && x.length ?
            Array.prototype.slice.call(x) :
            x;
    }




    p.getMaxShift = function getMaxShift () {
        return arrCopy(this._state.maxShift);
    };

    p.isShiftAbove = function isShiftAbove (s) {
        var sxy = this.getMaxShift();
        return vLenSq(sxy) > s*s;
    };

    p.getReference = function getReference () {
        return arrCopy(this._state.reference);
    };

    p.getOrigin = function getOrigin () {
        return arrCopy(this._state.origin);
    };

    p.getScroll = function getScroll () {
        return arrCopy(this._state.scroll);
    };

    p.getWheelReleaseTimer = function getWheelReleaseTimer () {
        return this._state.wheelTimer;
    };

    p.getVelocity = function getVelocity () {
        return arrCopy(this._state.velocity);
    };

    p.isVelocityAbove = function isVelocityAbove (v) {
        v = Math.abs(v);
        var v0 = this.getVelocity();
        var vx = Math.abs(v0[0]);
        var vy = Math.abs(v0[1]);

        var dv =
            this.mode === 'y' ?
                vy - v :
            this.mode === 'xy' ?
                vLenSq([vx, vy]) - v*v :
                vx - v;

        return dv > 0;
    };


    p.tap = function tap (ev) {
        if ( ! this.isEventRelevant(ev) ) return;

        var xy = this.getXY(ev);
        this._tap(xy);

        return _stopEvent(ev);
    };

    p._tap = function _tap (xy) {
        this._state.origin = this._state.reference = xy;
        this._state.timestamp = Date.now();
        this._state.maxShift = [0, 0];
    };



    p.move = function move (ev) {
        if ( this._state.throttle ) return _stopEvent(ev);
        if ( this._state.reference === null ) return _stopEvent(ev);
        if ( ! vIsZero(this._state.scroll) || null !== this._state.wheelTimer ) return _stopEvent(ev);

        this.throttle();
        var xy = this.getXY(ev);
        this._move(xy);

        return _stopEvent(ev);
    };

    p._move = function _move (xy) {
        var dxy = vDiff(xy, this._state.reference);

        if ( typeof this.onmove === 'function' ) {
            this.onmove(dxy[0], dxy[1]);
        }

        this.updateMaxShift(xy);
        this.updateVelocity(dxy);
        this._state.reference = xy;

    };

    p.updateMaxShift = function updateMaxShift (pos) {
        var origin   = this._state.origin;
        var maxShift = this._state.maxShift;

        var shift = vDiffAbs(pos, origin);

        maxShift[0] = shift[0] > maxShift[0] ? shift[0] : maxShift[0];
        maxShift[1] = shift[1] > maxShift[1] ? shift[1] : maxShift[1];
    }

    p.updateVelocity = function (dxy) {
        var timestamp = Date.now();
        var dt = 1 + timestamp - this._state.timestamp;
        var vx = 1000 * dxy[0] / dt;
        var vy = 1000 * dxy[1] / dt;
        this._state.velocity = [
            0.8*vx + 0.2*this._state.velocity[0],
            0.8*vy + 0.2*this._state.velocity[1]
        ];
        this._state.timestamp = timestamp;
    }



    p.release = function release (ev) {
        var target = ev.type !== 'mouseleave' ? ev.target : null;
        this._release(target);
        return _stopEvent(ev);
    };

    p._release = function _release (target) {
        var v;
        if ( this.isShiftAbove(this.clickThreshold) ) {
            if ( this.isVelocityAbove(10) ) {
                v = this.getVelocity();
                this.autoscroll(v, this._state.timestamp);
            }
        }
        else {
            if ( typeof this.onmove === 'function' ) {
                var o = this.getOrigin();
                var r = this.getReference();
                if ( o && r ) this.onmove(o[0]-r[0], o[1]-r[1]);
            }

            if ( target && typeof this.onclick === 'function' ) {
                this.onclick(target);
            }
        }

        this._cleanState();
    }


    p.wheel = function wheel (ev) {
        if ( this._state.throttle ) return _stopEvent(ev);
        if ( ! this.isEventRelevant(ev) ) return _stopEvent(ev);

        if ( this._state.reference === null ) {
            this._tap( this.getXY(ev) );
            this._startWheelReleaseTimer();
        }

        var dx = this.getDeltaXY(ev);
        dx = [
            (dx[0] < 0 ? -WHEEL_DELTA : WHEEL_DELTA),
            (dx[1] < 0 ? -WHEEL_DELTA : WHEEL_DELTA)
        ];

        this._state.scroll = vAdd(this._state.scroll, dx); // FIXME: very ugly state manipulation

        this.throttle();

        return _stopEvent(ev);
    };


    p._startWheelReleaseTimer = function _startWheelReleaseTimer () {
        var _this = this;

        this._state.wheelTimer = $timeout(function () {
            if ( _this._state.scroll === 0 ) {
                return _this._release();
            }

            var newRef = _this._state.reference + _this._state.scroll;
            _this._move(newRef);
            _this._state.reference = newRef;
            _this._state.scroll = 0;
            _this._startWheelReleaseTimer();
        }, WHEEL_TIMEOUT, false);
    };


    p.autoscroll = function autoscroll (amplitude, t0, prevShift) {
        amplitude = amplitude instanceof Array ? amplitude : [amplitude, 0];
        amplitude = prevShift ? amplitude : vScale(amplitude, 0.8);
        var _this = this;
        var shift = [0, 0];
        var delta = [0, 0];
        var d;

        if ( prevShift ) {
            shift = this.autoshift(amplitude, t0);
            delta = vDiffAbs(shift, amplitude);

            if ( delta[0] < 0.5 && delta[1] < 0.5 ) {
                d = vDiff(amplitude, prevShift);
                this.onmove(d[0], d[1]);
                return;
            }

            d = vDiff(shift, prevShift);
            this.onmove(d[0], d[1]);
        }

        $window.requestAnimationFrame( function () {
            _this.autoscroll(amplitude, t0, shift);
        });
    };

    p.autoshift = function autoshift (amplitude, t0) {
        var tau = ( t0 - Date.now() ) / 325.0;
        var d = 1.0 - Math.exp(tau);
        return vScale(arrCopy(amplitude), d);
    };


    function _stopEvent (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }


    function vDiff (v1, v2) {
        return [
                v1[0] - v2[0],
                v1[1] - v2[1]
        ];
    }


    function vAdd (v1, v2) {
        return [
            (v1[0] + v2[0]),
            (v1[1] + v2[1])
        ];
    }


    function vDiffAbs (v1, v2) {
        return [
                Math.abs(v1[0] - v2[0]),
                Math.abs(v1[1] - v2[1])
        ];
    }

    function vLenSq (v) {
        return v[0]*v[0] + v[1]*v[1];
    }

    function vScale (v, factor) {
        v[0] = v[0] * factor;
        v[1] = v[1] * factor;
        return v;
    }

    function vIsZero (v) {
        return v && v[0] === 0 && v[1] === 0;
    }


    return {
        attachTo:  attachTo,
        Movements: Movements
    };
}]);
