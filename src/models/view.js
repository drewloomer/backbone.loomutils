/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'epoxy'
], function ($, Backbone, _, Epoxy) {

	'use strict';

	/**
	 * View model
	 */
	var ViewModel = Epoxy.Model.extend({

		/**
		 * Default model values
		 * @type {Object}
		 */
		defaults: {
			loaded: false,
			active: false,
			loadedComponents: {},
			target: '',
			role: '',
			view: '',
			replace: false,
			rendered: false,
			children: undefined,
			default: undefined
		},


		/**
		 * Computed properites
		 * @type {Object}
		 */
		computeds: {
			activeChild: function (children) {
				return this.activeChild();
			}
		},


		/**
		 * Initialize
		 */
		initialize: function () {

			this.set('children', new ViewsCollection());
			this.set('loadedComponents', {
				loader: false,
				children: false
			});
		},


		/**
		 * Get the active child for a role
		 * @param {String} role
		 */
		activeChild: function (role) {
			return this.get('children').active(role || 'primary');
		}


		/**
		 * Triggered by the view on load
		 */
		onLoaded: function () {

			this.trigger('loaded', this);
		}
	});


	/**
	 * Views collection - declared here because of circular dependencies
	 */
	var ViewsCollection = Backbone.Collection.extend({

		/**
		 * Default model
		 * @type {Function}
		 */
		model: ViewModel,


		/**
		 * How many of the children have loaded?
		 * @type {Number}
		 */
		loadedCount: 0,


		/**
		 * Add a child to the collection from a view definition
		 * @param {Object} child
		 */
		addFromDefinition: function (child) {

			var view = child.view ? child.view : child,
				target = child.target || undefined,
				Constructor = typeof view === 'function' ? view : undefined;


			// New instance of the child if we need to
			if (Constructor) {
				view = new Constructor({
					collection: child.collection || view.prototype.collection,
					model: child.model || view.prototype.model
				});
			}

			// New model if the view doesn't have one
			var viewModel = view.viewModel || new this.model();


			// Listen to the view for load events
			viewModel.listenToOnce(view, 'loaded', viewModel.onLoaded);


			// Set model properties
			viewModel.set({
				id: view.id,
				view: view,
				target: target,
				replace: child.replace,
				role: child.role || '',
				default: child.default
			});


			// Let the view know about its model if it doesn't already
			view.viewModel = viewModel;


			// Add the model to the collection
			this.add(viewModel);
		},


		/**
		 * Get the child active in a role
		 * @return {Object}
		 */
		active: function (role) {

			if (!role) {
				return;
			}

			return this.findWhere({
				active: true,
				role: role
			});
		}
	});


	return ViewModel;
});