/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore'
], function ($, Backbone, _) {

	var R = Backbone.Router.extend({

		/**
		 * Routes to listen to
		 * @type {Object}
		 */
		routes: {
			'': 'home'
		},


		/**
		 * History of known routes
		 * @type {Array}
		 */
		knownHistory: [],


		/**
		 * If the last route was supposed to not be tracked, store it here so
		 * that we don't accidentally track it in the loadUrl override
		 * @type {String}
		 */
		lastUntracked: null,


		/**
		 * Is this enabled?
		 * @type {Boolean}
		 */
		enabled: true,


		/**
		 * Initialize the router
		 */
		initialize: function () {


		},


		/**
		 * Navigate to the default route
		 */
		defaultRoute: function () {

			var def = this.routes[''];

			if (def) {
				this.redirect(def);
			}
		},


		/**
		 * Load URL override to store history of all fragments, not just those called internally
		 * @param {String} fragment [description]
		 */
		loadUrl: function (fragment) {

			// Don't add a duplicate and don't add something that is supposed to be untracked
			if (this.previous() !== fragment && this.lastUntracked !== fragment) {
				this.knownHistory.push(fragment);
			}

			Backbone.Router.prototype.loadUrl.apply(this, arguments);
		},


		/**
		 * Navigate override to maintain a history
		 * @param {String} fragment
		 * @param {Object} options
		 */
		navigate: function (fragment, options) {

			var noTrack = options.noTrack || undefined;

			if (noTrack !== false) {
				this.knownHistory.push(fragment);
				this.lastUntracked = null;
			}
			else {
				this.lastUntracked = fragment;
			}

			Backbone.Router.prototype.navigate.apply(this, arguments);
		},


		/**
		 * Get the current route
		 */
		currentRoute: function() {
			var Router = this,
				fragment = Backbone.history.fragment,
				routes = _.pairs(Router.routes),
				route = null, params = null, matched;

			matched = _.find(routes, function(handler) {
				route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
				return route.test(fragment);
			});

			if(matched) {
				// NEW: Extracts the params using the internal
				// function _extractParameters
				params = Router._extractParameters(route, fragment);
				route = matched[1];
			}

			return {
				route : route,
				fragment : fragment,
				params : params
			};
		},


		/**
		 * Get the current route fragment
		 */
		current: function () {
			return this.currentRoute().fragment;
		},


		/**
		 * Get the previous route fragment
		 */
		previous: function () {
			return _.last(this.knownHistory);
		},


		/**
		 * Redirect the user to a route. Same as navigate but with a guaranteed trigger.
		 * @param {String} path
		 * @param {Boolean} noTrack
		 */
		link: function (path, noTrack) {

			if (!this.enabled) {
				return;
			}

			if (this.knownHistory.length === 0) {
				this.knownHistory.push(this.current());
			}

			path = path || this.routes[''];

			if (path) {
				this.navigate(path, {trigger: true, noTrack: noTrack});
			}
		},


		/**
		 * Redirect the user to a route. Same as navigate but with a guaranteed trigger.
		 * @param {String} path
		 * @param {Boolean} noTrack
		 */
		redirect: function (path, noTrack) {

			if (!this.enabled) {
				return;
			}
			
			if (this.knownHistory.length === 0) {
				this.knownHistory.push(this.current());
			}

			path = path || this.routes[''];

			if (path) {
				this.navigate(path, {trigger: true, replace: true, noTrack: noTrack});
			}
		}
	});

	return R;
});