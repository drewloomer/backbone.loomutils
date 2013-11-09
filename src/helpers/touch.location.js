/*global define*/

define([
	'jquery',
	'backbone',
	'underscore'
], function ($, Backbone, _) {

	'use strict';

	var L = function ()	{
		this.initialize.apply(this, arguments);
		return this;
	};

	_.extend(L.prototype, Backbone.Events, {

		/**
		 * The id for the location
		 * @type {String}
		 */
		id: '',


		/**
		 * X coordinate
		 * @type {Number}
		 */
		left: 0,


		/**
		 * Y coordinate
		 * @type {Number}
		 */
		top: 0,


		/**
		 * Width of the box
		 * @type {Number}
		 */
		width: 0,


		/**
		 * Height of the box
		 * @type {Number}
		 */
		height: 0,


		/**
		 * The element we're tied to
		 * @type {Object}
		 */
		el: {},


		/**
		 * Is the element on?
		 * @type {Boolean}
		 */
		isTouched: false,


		/**
		 * Bit flag that gets sent to the server for this location
		 * @type {Number}
		 */
		flag: 0,


		/**
		 * Initialize the touch location
		 * @param {String} id
		 * @param {Object} params
		 */
		initialize: function (id, params) {

			if (!params) {
				return false;
			}

			this.id = id;
			this.left = params[0];
			this.top = params[1];
			this.width = params[2];
			this.height = params[3];
			this.el = params[4];
			this.flag = params[5];

			// this.on('touchStart', this.touched, this);
			this.on('touchEnd', this.untouched, this);

			return this;
		},


		/**
		 * Given a set of coordiantes, determine if this location is being touched
		 * @param {Number} left
		 * @param {Number} top
		 * @param {Boolean} end Is this an end event?
		 */
		isBeingTouched: function (left, top, end) {

			var leftTouch = left >= this.left && left <= this.left + this.width,
				topTouch = top >= this.top && top <= this.top + this.height,
				touched = false;

			if (leftTouch && topTouch) {
				touched = true;
			}

			if (touched && !end) {
				this.touched();
			}
			else {
				this.untouched();
			}

			return touched;
		},


		/**
		 * When the element is being touched
		 */
		touched: function () {

			if (!this.isTouched) {
				this.isTouched = true;
				this.el.trigger('touched');
				this.el.addClass('touched');
				this.trigger('on', this);
			}
		},


		/**
		 * When the element is no longer being touched
		 */
		untouched: function () {

			if (this.isTouched) {
				this.isTouched = false;
				this.el.trigger('untouched');
				this.el.removeClass('touched');
				this.trigger('off', this);
			}
		}
	});

	return L;
});