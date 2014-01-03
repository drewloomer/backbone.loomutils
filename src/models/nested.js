/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'epoxy'
], function ($, Backbone, _, Epoxy) {

	var M = Epoxy.Model.extend({

		/**
		 * Values to not JSONify
		 * @type {Object}
		 */
		blacklist: {},


		/**
		 * Values to JSONify
		 * @type {Object}
		 */
		whitelist: {},


		/**
		 * Initialize override
		 */
		initialize: function () {

			// Add object listeners
			this._setupListeners();


			// Super
			Epoxy.Model.prototype.initialize.apply(this, arguments);
		},


		/**
		 * Setup listeners
		 */
		_setupListeners: function () {

			_.each(this.listeners, this._setupListenerGroup, this);
		},


		/**
		 * Setup a group of listeners
		 * @param {Object} group
		 * @param {String} name
		 */
		_setupListenerGroup: function (group, name) {

			var obj;

			if (name === 'this') {
				obj = this;
			}
			else if (this.get(name)) {
				obj = this.get(name)
			}
			else if (this[name]) {
				obj = this[name];
			}

			if (!obj) {
				return;
			}

			_.each(group, function (methodName, eventName) {
				this._setupListener(obj, eventName, methodName);
			}, this);
		},


		/**
		 * Setup a listener listener
		 * @param {Object} obj
		 * @param {String} eventName
		 * @param {String} methodName
		 */
		_setupListener: function (obj, eventName, methodName) {

			var callback = this[methodName] || undefined;

			if (!callback) {
				return;
			}

			this.listenTo(obj, eventName, callback);
		},


		/**
		 * Override to obey white and blacklists
		 * @param  {Object} options
		 * @return {Object}
		 */
		toJSON: function (options) {

			var json = {};

			options = options || {};

			if (options.mode) {
				if (this.whitelist[options.mode]) {
					json = _.pick(Epoxy.Model.prototype.toJSON.call(this, options), this.whitelist[options.mode]);
				}
				else if (this.blacklist[options.mode]) {
					json = _.omit(Epoxy.Model.prototype.toJSON.call(this, options), this.blacklist[options.mode]);
				}
				else {
					json = Epoxy.Model.prototype.toJSON.call(this, options);
				}
			}
			else {
				json = Epoxy.Model.prototype.toJSON.call(this, options);
			}

			if (options.recursive === true) {
				_.each(json, function (object, key) {
					if (object && object.toJSON && typeof object.toJSON === 'function') {
						json[key] = object.toJSON(options);
					}
				});
			}

			return json;
		}
	});

	return M;
});