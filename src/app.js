/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'router',
	'views/app'
], function ($, Backbone, _, router, AppView) {

	// Normalize the resize and orientation events
	$(window).on('resize orientationchange', _.debounce(function () {
		$(this).trigger('resizeOrRotate');
	}, 50));


	// New application module
	var App = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(App.prototype, Backbone.Events, {

		/**
		 * The router
		 * @type {Object}
		 */
		router: router,


		/**
		 * Use the push state
		 * @type {Boolean}
		 */
		usePushState: false,


		/**
		 * Initialize the application
		 */
		initialize: function () {

			// Once the document is ready, start the application
			$(document).ready(_.bind(this.start, this));
		},


		/**
		 * Start the app
		 */
		start: function () {

			// New view
			this.view = new AppView();
			this.view.render();


			// Start tracking history
			Backbone.history.start({
				pushState: this.usePushState,
				root: $('base').attr('href') || ''
			});


			// Do we have a route yet?
			if (!this.router.currentRoute().fragment) {
				this.router.default();
			}
		}
	});


	return App;
});