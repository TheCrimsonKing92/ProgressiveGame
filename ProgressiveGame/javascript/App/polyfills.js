(function () {

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            var len = O.length >>> 0;

            if (len === 0) {
                return -1;
            }

            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            if (n >= len) {
                return -1;
            }

            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }

            return -1;
        }
    }

    function CustomEvent(event, params) {
        //https://developer.mozilla.org/en-US/docs/WEB/API/CustomEvent/CustomEvent polyfill for IE 9+
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    
    window.CustomEvent = CustomEvent;
})();