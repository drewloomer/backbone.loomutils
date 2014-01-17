/*global define*/

define([
	'underscore',
	'config'
], function (_, config) {

	'use strict';

	var L = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(L.prototype, {

		/**
		 * Initialize
		 */
		initialize: function () {


		},


		/**
		 * Log a message
		 */
		log: function () {

			if (window.console && window.console.log && (!config || config.loggingEnabled !== false)) {
				window.console.log(Array.prototype.slice.call(arguments));
			}
		},


		/**
		 * Log a message
		 */
		dir: function () {

			if (window.console && window.console.dir && (!config || config.loggingEnabled !== false)) {
				window.console.dir(Array.prototype.slice.call(arguments));
			}
		}
	});

	return new L();
});