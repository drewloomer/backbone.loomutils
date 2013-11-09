/*global define*/

define([
	'jquery',
	'backbone',
	'underscore'
], function ($, Backbone, _) {

	'use strict';

	var A = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(A.prototype, Backbone.Events, {

		/**
		 * Initialize
		 */
		initialize: function () {

		},


		/**
		 * When a transition ends, run the callback
		 * @param {Object} element
		 * @param {Function} callback
		 */
		onTransitionEnd: function (element, callback) {

			element.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function (e) {
				if ( e.target === element[0] ) {
					callback(e);
				}
			});
		}
	});


	return A;
});