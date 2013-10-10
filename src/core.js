(function(global, $) { "use strict";

    var pick = function(obj) {
        var copy = {},
            keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1)),
            key;

        for (var x = 0; x < keys.length; x++) {
            key = keys[x];
            if (key in obj) copy[key] = obj[key];
        }

        return copy;
    };

    var keys = Object.keys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object.');
        var keys = [];
        for (var key in obj) if (obj.hasOwnProperty(key)) keys[keys.length] = key;
        return keys;
    };

    var Popup = (function() {

        var withEvents = (function() {
            var prefixed = function(evt) {
                return evt + '.' + Popup.CONFIG.evt_namespace;
            };

            return function (action) {
                var self = this;

                $.each(Popup.EVENTS, function(selector, events) {
                    if (selector in self.selectors) {
                        $.each(events, function(event, callable) {
                            if (typeof self[callable] == 'function') {
                                action.call(self, self.$el.find(selector), prefixed(event), self[callable]);
                            }
                        })
                    }
                });
            }
        })();

        var bindEvent = function($element, event, callback) {
            $element.on(event, callback);
        };

        var unbindEvent = function($element, event, callback) {
            $element.off(event, callback);
        };

        var createBackground = function() {
            return $('<div/>').css({
                position: 'fixed',
                top:        0,
                left:       0,
                opacity:    0,
                background: this.options.color
            });
        };

        var initialize = function() {
            this.$background = createBackground.call(this);
            withEvents.call(this, bindEvent);

            this.show();
        };

        return function(parameters) {
            if (!parameters.element) {
                throw new Error("Element is not defined.");
            }

            parameters.options || (parameters.options = {});

            $.extend(this, {
                $el:         $(parameters.element),
                options:     $.extend(true, {}, Popup.OPTIONS, pick(parameters.options, keys(Popup.OPTIONS))),
                selectors:   $.extend(true, {}, Popup.SELECTORS, pick(parameters.options, keys(Popup.SELECTORS)))
            });

            initialize.call(this);
        }
    })();

    Popup.CONFIG = {
        evt_namespace: 'best-popup'
    };

    Popup.EVENTS = {
        close: {
            'click': 'close'
        }
    };

    Popup.OPTIONS = {
        easing:   'swing',
        speedIn:  100,
        speedOut: 100,
        color:    '#000',
        opacity:  0.8,
        fx: {
            background: 'simple',
            popup:      'simple'
        },
        processor: {
            background: 'opacity',
            popup:      'center'
        }
    };

    Popup.SELECTORS = {
        space: 'body',
        close: 'popup-close'
    };

    Popup.FX = {
        simple: function($element, css, options) {
            return $element.animate(css, options.speed);
        }
    };

    Popup.PROCESSOR = {
        opacity: function($element, options) {
            var css = {};
            switch (options.direction) {
                case "out":
                    css.opacity = 0;
                    break;
                default:
                    css.opacity = options.opacity;
                    break;
            }

            return css;
        },
        center: function($element, options) {
            var $space = $(this.selectors.space),
                css = {};

            switch (options.direction) {
                case "out":
                    css.left = $space.width() - $element.outerWidth(true) / 2;
                    css.top = -1 * $element.outerHeight(true);
                    break;
                default:
                    css.left = $space.width() - $element.outerWidth(true) / 2;
                    css.top  = $space.height() - $element.outerHeight(true) / 2;
                    break;
            }

            return css;
        }
    };

    Popup.prototype = (function() {

        var appendElement = function($element) {
            $(this.selectors.space).append($element);
        };

        return {
            constructor: Popup,

            show: function() {
                var self = this;

                appendElement.call(this, this.$background);

                Popup.FX[this.options.fx.background].call(this, this.$background, Popup.PROCESSOR[this.options.processor.background].call(this, this.$background, {opacity: self.options.opacity})).done(function() {

                    appendElement.call(this, this.$el);

                    Popup.FX[self.options.fx.popup].call(this, this.$el, Popup.PROCESSOR[self.options.processor.popup].call(this, self.$el));

                });
            },

            hide: function() {

            }
        }
    })();

}).call(this, jQuery);