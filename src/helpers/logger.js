/*global define*/

define([
	'underscore'
], function (_) {

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

			if (window.console && window.console.log) {
				window.console.log.apply(window.console, arguments);
			}
		},


		/**
		 * Log a message
		 */
		dir: function () {

			if (window.console && window.console.dir) {
				window.console.dir.apply(window.console, arguments);
			}
		}
	});

	return new L();
});