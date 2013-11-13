/*global define*/

define([
	'jquery',
	'backbone',
	'underscore'
], function ($, Backbone, _) {

	'use strict';

	var S = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(S.prototype, Backbone.Events, {

		/**
		 * Do we have support for local storage or do we need to use cookies?
		 * @type {Boolean}
		 */
		localStorageSupport: false,


		/**
		 * Initialize the local storage
		 */
		initialize: function () {

			this.localStorageSupport = typeof Storage !== 'undefined' && typeof localStorage !== 'unknown' && localStorage ? true: false;

			return this;
		},


		/**
		 * Store a key/value pair or several
		 * @param {Mixed} key Either the key or object of key/value pairs
		 * @param {Mixed} val The value or null
		 */
		set: function (key, val) {

			// Loop through objects
			if (typeof key === 'array') {
				_.each(key, function(v, k) {
					this.set(k, v);
				});
				return;
			}

			// If value is an object, stringify it
			if (typeof val === 'object' || typeof val === 'array') {
				val = JSON.stringify(val);
			}

			// Do we support local storage?
			if (this.localStorageSupport) {
				return localStorage.setItem(key, val);
			}

			// Set a cookie instead
			return this._setCookie(key, val);
		},


		/**
		 * Retrive a key/value
		 * @param {String} key
		 */
		get: function (key) {

			var data;

			// Do we support local storage?
			if (this.localStorageSupport) {
				data = localStorage.getItem(key);
			}
			// Get a cookie instead
			else {
				data = this._getCookie(key);
			}

			return data === null ? null: $.parseJSON(data);
		},


		/**
		 * Delete a key/value pair
		 * @param {String} key
		 */
		remove: function (key) {

			if (this.localStorageSupport) {
				return localStorage.removeItem(key);
			}

			return this._removeCookie(key);
		},


		/**
		 * Store a cookie
		 * @param {String} key
		 * @param {Mixed} val
		 * @param {Number} exp How many days until this expires?
		 */
		_setCookie: function (key, val, exp) {

			if ( exp === 'undefined' ) {
				exp = 365;
			}

			var date = new Date();
			date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
			var expires = '; expires=' + date.toGMTString();

			document.cookie = key + '=' + val + expires + '; path=/';
		},


		/**
		 * Retrieve a cooki
		 * @param {String} key
		 */
		_getCookie: function (key) {

			var nameEQ = key + '=',
				ca = document.cookie.split(';');

			for (var i = 0, max = ca.length; i < max; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
			return null;
		},


		/**
		 * Remove a cookie
		 * @param {String} key
		 */
		_removeCookie: function (key) {

			return this.setCookie(key, null, -1);
		}
	});

	return S;
});