define(['backbone', 'underscore', 'jquery'], function (Backbone, _, $) {
    "use strict";

    var $window = $(window);

    /**
     * @class AnchorClass
     * @extends Backbone.Model
     */
    var AnchorClass = Backbone.Model.extend(/**@lends AnchorClass#*/{
        /**
         * @constructs
         */
        initialize: function () {
            Backbone.Model.prototype.initialize.call(this);
            this._parseHash();
            this.on('change', this._updateHash, this);
            $window.on('hashchange', this._parseHash.bind(this));
        },

        /**
         * @private
         * @listens window#hashchange
         * @fires AnchorClass#hashchange
         */
        _parseHash: function () {
            var hash = location.hash;
            if ('#' + this.pairs().join('&') === hash) {
                return;
            }

            var hashObject = this.parseHash(hash);

            _.chain(this.attributes).keys().forEach(function (key) {
                if (!hashObject[key]) {
                    //we need to unset old values if they are not in new hash
                    //silently, because we need exactly one change event
                    //change:prop will be triggered anyway
                    this.unset(key, {silent: true});
                }
            }, this);
            this.set(hashObject);
            /**
             * @event AnchorClass#hashchange
             */
            this.trigger('hashchange');
        },

        /**
         * @param {string} hash
         * @returns {object}
         */
        parseHash: function (hash) {
            var hashObject = {};
            if (hash.length) {
                hash = hash.substring(1);
                var pairs = hash.split('&');
                for (var i = 0, l = pairs.length; i < l; i++) {
                    var pair = pairs[i].split('=');
                    hashObject[pair[0]] = pair[1] ? decodeURIComponent(pair[1]) : null;
                }
            }
            return hashObject;
        },

        /**
         * @private
         */
        _updateHash: function () {
            var hash = this.build();
            var scrollTop = 0;
            if (!hash) {
                scrollTop = $window.scrollTop();
            }
            location.hash = hash;
            if (scrollTop) {
                $window.scrollTop(scrollTop);
            }
        },

        /**
         * @public
         * @returns {string}
         */
        build: function () {
            return this.pairs().join('&');
        },

        /**
         * @param {Object.<String>} object
         * @returns {Array.<String>}
         * @private
         */
        _pairs: function (object) {
            var pairs = [];
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    var value = object[prop];
                    pairs.push(prop + (value ? '=' + encodeURIComponent(value) : ''));
                }
            }
            return pairs;
        },

        /**
         * @returns {Array.<String>}
         */
        pairs: function () {
            return this._pairs(this.attributes);
        },

        /**
         * @returns {Array.<String>}
         */
        changedPairs: function () {
            return this._pairs(this.changed);
        },

        /**
         * @param {String} [attr]
         * @return {String|null|undefined} location.hash or value of attr
         */
        get: function (attr) {
            return arguments.length ? Backbone.Model.prototype.get.apply(this, arguments) : location.hash;
        },

        /**
         * @param {String} attr
         * @returns {boolean}
         */
        has: function (attr) {
            return this.get(attr) !== undefined;
        }
    });

    return new AnchorClass;
});
