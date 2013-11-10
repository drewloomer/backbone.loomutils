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
		 * Initialize the router
		 */
		initialize: function () {


		},


		/**
		 * Navigate to the default route
		 */
		default: function () {

			var def = this.routes[''];

			if (def) {
				this.redirect(def);
			}
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
		 * Redirect the user to a route. Same as navigate but with a guaranteed trigger.
		 * @param {String} path
		 */
		link: function (path) {

			path = path || this.routes[''];

			if (path) {
				this.navigate(path, {trigger: true});
			}
		},


		/**
		 * Redirect the user to a route. Same as navigate but with a guaranteed trigger.
		 * @param {String} path
		 */
		redirect: function (path) {

			path = path || this.routes[''];

			if (path) {
				this.navigate(path, {trigger: true, replace: true});
			}
		}
	});

	return R;
});