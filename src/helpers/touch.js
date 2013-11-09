/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'loomutils/helpers/touch.location'
], function ($, Backbone, _, Location) {

	'use strict';

	var T = function () {
		this.initialize.apply(this, arguments);
		return this;
	};

	_.extend(T.prototype, Backbone.Events, {

		/**
		 * The element to be listening to
		 * @type {Object}
		 */
		el: {},


		/**
		 * The touch locations we're tracking
		 * @type {Object}
		 */
		locations: {},


		/**
		 * Initialize the touch helper
		 * @param {Object} params
		 */
		initialize: function (params) {

			if (!params || !params.el) {
				return false;
			}


			// Set the element to listen to
			this.el = params.el;


			// The locations to tie to touch events
			this.parseLocations(params.locations);


			// Listen for touch events
			this.el.on('touchstart touchmove touchend touchleave touchcancel', _.bind(this.touch, this));
		},


		/**
		 * Route touch events
		 * @param {Object} e
		 */
		touch: function (e) {

			e.stopPropagation();
			e.preventDefault();

			var touches = e.originalEvent.targetTouches,
				type = e.type;

			if (type === 'touchend' || type === 'touchleave' || type === 'touchcancel') {
				return this.end();
			}

			_.each(touches, function (touch) {
				this.delegate(type, touch);
			}, this);
		},


		/**
		 * Delegate a touch event to the proper method
		 * @param {String} type
		 * @param {Object} touch
		 */
		delegate: function (type, touch) {

			switch (type) {
			case 'touchstart':
				this.start(touch);
				break;
			case 'touchmove':
				this.move(touch);
				break;
			}
		},


		/**
		 * Touch starts
		 * @param {Object} touch
		 */
		start: function (touch) {

			var locationsTouched = this.locationsTouched(touch);

			this.triggerLocations(locationsTouched, 'touchStart');
		},


		/**
		 * Touch moves
		 * @param {Object} touch
		 */
		move: function (touch) {

			var locationsTouched = this.locationsTouched(touch);

			this.triggerLocations(locationsTouched, 'touchMove');
		},


		/**
		 * Touch ends
		 */
		end: function () {

			this.triggerLocations(this.locations, 'touchEnd');
		},


		/**
		 * Parse locations from the locations parameter
		 * @param {Object} locations
		 */
		parseLocations: function (locations) {

			this.locations = {};

			_.each(locations, function (data, key) {

				var location = new Location(key, data);

				if (location) {
					this.locations[key] = location;
					this.listenTo(this.locations[key], 'on', this.locationOn);
					this.listenTo(this.locations[key], 'off', this.locationOff);
				}
			}, this);
		},


		/**
		 * Find which elements are being touched given an event
		 * @param {Object} touch
		 * @param {Boolean} end
		 */
		locationsTouched: function (touch, end) {

			// Calculate the left and top location relative to the element
			var offsetLeft = this.el.offset().left,
				offsetTop = this.el.offset().top,
				left = touch.pageX - offsetLeft,
				top = touch.pageY - offsetTop,
				// radius = touch.webkitRadiusX || 10,
				locationsTouched = [];


			// See if any of the locations are in the touch radius
			_.each(this.locations, function (location) {

				if (location.isBeingTouched(left, top, end)) {
					locationsTouched.push(location);
				}
			}, this);


			return locationsTouched;
		},


		/**
		 * Trigger touch events on locations
		 * @param {Array} locations
		 * @param {String} eventName
		 */
		triggerLocations: function (locations, eventName) {

			_.each(locations, function (location) {
				location.trigger(eventName, location);
			}, this);
		},


		/**
		 * Report that a location is turned on
		 * @param {Object} location
		 */
		locationOn: function (location) {

			this.trigger('on', location);
			// console.log('on ' + location.id);
		},


		/**
		 * Report that a location is turned off
		 * @param {Object} location
		 */
		locationOff: function (location) {

			this.trigger('off', location);
			// console.log('off ' + location.id);
		},


		/**
		 * Bitmask data for the active locations
		 * @return {Number}
		 */
		mask: function () {

			var mask = 0;

			_.each(this.locations, function (location) {
				if (location.isTouched) {
					mask += 0x01 << location.flag;
				}
			});

			return mask;
		}
	});

	return T;
});