/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'models/viewstate'
], function ($, Backbone, _, ViewChild) {

	var C = Backbone.Collection.extend({

		/**
		 * Default model
		 * @type {Function}
		 */
		model: ViewChild,


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
			var state = view.state || new this.model();


			// Listen to the view for load events
			state.listenToOnce(view, 'loaded', state.onLoaded);


			// Set model properties
			state.set({
				id: view.id,
				view: view,
				target: target,
				replace: child.replace,
				role: child.role || '',
				default: child.default
			});


			// Let the view know about its model if it doesn't already
			view.state = state;


			// Add the model to the collection
			this.add(state);
		}
	});

	return C;
});