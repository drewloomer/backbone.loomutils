/*global define*/

define([
	'jquery',
	'underscore',
	'handlebars',
	'router',
	'epoxy',
	'loomutils/helpers/loader',
	'loomutils/helpers/route-callback',
	'loomutils/models/view',
	'loomutils/helpers/logger'
], function ($, _, Handlebars, router, Epoxy, Loader, RouteCallback, ViewModel, logger) {

	'use strict';

	var V = Epoxy.View.extend({

		/**
		 * Reference to the router
		 * @type {Object}
		 */
		router: router,


		/**
		 * Loader helper
		 * @type {Object}
		 */
		_loader: {},


		/**
		 * Model holds state info we want to be able to trigger events on
		 * @type {Model}
		 */
		viewModel: undefined,


		/**
		 * Default template
		 * @type {Function}
		 */
		template: Handlebars.compile(''),


		/**
		 * Child views
		 * @type {Array}
		 */
		children: [],


		/**
		 * Routes
		 * @type {Object}
		 */
		routes: {},


		/**
		 * Event listeners on objects
		 * @type {Object}
		 */
		listeners: {},


		/**
		 * DOM events
		 * @type {Object}
		 */
		events: {
			'click [data-link]': 'linkElement'
		},


		/**
		 * Initialize
		 */
		initialize: function () {

			// New model instance
			this.viewModel = this.viewModel || new ViewModel();


			// Listen to viewModel changes
			this.listenTo(this.viewModel, 'change:active', this.onActiveChange);
			this.listenTo(this.viewModel.get('children'), 'change:active', this.onChildActiveChange);


			// New loader instance
			this._setupLoader();


			// New child model instance
			this._setupChildrenCollection();


			// Add route listeners
			this._setupRoutes();


			// Add object listeners
			this._setupListeners();


			// Listen for load events
			this.on('loaderLoaded childrenLoaded', this.onComponentLoaded);


			// When we render, load the rendered content
			this.on('rendered', this.load);
		},


		/**
		 * Render the view
		 */
		render: function () {

			// Remove event bindings
			this.undelegateEvents();


			// Render the template
			this.$el.html('').append(this.template(this.getData()));


			// Readd events
			this.delegateEvents();


			// Render the children
			this.renderChildren();


			// Apply epoxy view bindings
			this.applyBindings();


			// Dispatch a rendered event
			this.viewModel.set('rendered', true);
			this.trigger('rendered');
		},


		/**
		 * Load assets and dispatch a load event when done
		 */
		load: function () {

			this._loader.addElement(this.$el);
			this._loader.load();
		},


		/**
		 * Route to one of the children
		 * @param {String} id
		 * @param {String} route
		 * @param {Object} params
		 */
		routeTo: function (id, route, params) {

			try {
				var view = this.getChildView(id);
				view.routes[route].call(view, params);
			}
			catch (e) {
				console.log('Failed to route "' + route + '" on child "' + id + '"');
			}
		},


		/**
		 * Render child views
		 */
		renderChildren: function () {

			// Reset the number of children loaded
			this.viewModel.get('children').loadedCount = 0;


			// Loop through all of the children
			this.viewModel.get('children').each(this.renderChild, this);
		},


		/**
		 * Render a child view and append it
		 * @param {Object} child
		 */
		renderChild: function (child) {

			// Get the view
			var view = child.get('view'),
				target = child.get('target');


			// Render the child
			if (!child.get('rendered')) {
				view.render();
			}


			// If we're not loaded yet, wait to add the view until we are
			if (!child.get('loaded')) {
				return this.listenToOnce(child, 'loaded', this.renderChild);
			}


			// Place in the target area if we have one
			if (target) {

				// Are we supposed to replace the target?
				if (child.get('replace')) {
					this.$(target).replaceWith(view.$el);
				}
				else {
					this.$(target).append(view.$el);
				}
			}
			// Fallback placements
			else {

				// Get possible target areas
				var dataTarget = this.$('[data-child-area=' + view.id + ']'),
					childTarget = this.$('.children');


				// Place the child in the right area
				if (dataTarget.length) {
					dataTarget.append(view.$el);
				}
				else if (childTarget.length) {
					childTarget.append(view.$el);
				}
				else {
					this.$el.append(view.$el);
				}
			}
		},


		/**
		 * Get data from our collection or model
		 * @return {Mixed}
		 */
		getData: function () {

			if (this.collection) {
				return this.collection.toJSON({
					recursive: true
				});
			}
			else if (this.model) {
				return this.model.toJSON({
					recursive: true
				});
			}

			return {};
		},


		/**
		 * Get a child
		 * @param {String} id
		 */
		getChild: function (id) {

			var child = this.viewModel.get('children').get(id);

			return child;
		},


		/**
		 * Get a child's view
		 * @param {String} id
		 */
		getChildView: function (id) {

			var child = this.viewModel.get('children').get(id);

			return child ? child.get('view') : undefined;
		},


		/**
		 * Show the view
		 */
		show: function () {

			if (this.viewModel.get('active') === false) {
				this.viewModel.set('active', true);
				return;
			}
			this.$el.addClass('active');
			this.trigger('show');
		},


		/**
		 * Hide the view
		 */
		hide: function () {

			if (this.viewModel.get('active') === true) {
				this.viewModel.set('active', false);
				return;
			}
			this.$el.removeClass('active');
			this.hideChildren();
			this.trigger('hide');
		},


		/**
		 * Default
		 */
		showDefaultChild: function () {

			var child = this.viewModel.get('children').findWhere({defaultChild: true});

			if (child) {
				this.showChild(child);
			}
		},


		/**
		 * Show a child (and hide other) children in that role
		 * @param {Mixed} child
		 */
		showChild: function (id) {

			var child = typeof id !== 'object' ? this.getChild(id) : id;

			child.set('active', true);

			return child.get('view');
		},


		/**
		 * Hide a child
		 */
		hideChild: function (id) {

			var child = typeof id !== 'object' ? this.getChild(id) : id;

			child.set('active', false);
		},


		/**
		 * Hide all the children (called when we hide this view)
		 */
		hideChildren: function () {

			this.viewModel.get('children').each(function (child) {
				child.set('active', false);
			});
		},


		/**
		 * When we're done loading assets
		 */
		onLoaderLoaded: function () {

			this.viewModel.get('loadedComponents').loader =true;
			this.trigger('loaderLoaded', this);
		},


		/**
		 * When a child is done loading
		 */
		onChildLoaded: function () {

			this.viewModel.get('children').loadedCount++;

			if (this.viewModel.get('children').loadedCount === this.viewModel.get('children').length) {
				this.viewModel.get('loadedComponents').children = true;
				this.trigger('childrenLoaded', this);
			}
		},


		/**
		 * When any of the components are loaded
		 */
		onComponentLoaded: function () {

			if (_.contains(this.viewModel.get('loadedComponents'), false)) {
				return;
			}

			this.off('loaderLoaded childrenLoaded', this.onComponentLoaded);
			this.viewModel.set('loaded', true);
			this.trigger('loaded');
		},


		/**
		 * When the active viewModel changes
		 */
		onActiveChange: function (viewModel, active) {

			if (active) {
				return this.show();
			}

			this.hide();
		},


		/**
		 * When the active viewModel of a changes
		 */
		onChildActiveChange: function (viewModel, active) {

			// If the child became active, we need to
			// show this view as well
			if (active) {

				// First, hide other children in that region
				if (viewModel.get('role')) {

					var children = this.viewModel.get('children').where({role: viewModel.get('role')});
					_.each(children, function (c) {
						if (c !== viewModel && c.get('active')) {
							c.get('view').hide();
						}
					});
				}


				// Show the current view
				this.show();
			}
		},


		/**
		 * Setup route listeners
		 */
		_setupRoutes: function () {

			_.each(this.routes, this._setupRoute, this);
		},


		/**
		 * Setup a route listener
		 * @param {Function} callback
		 * @param {String} route
		 */
		_setupRoute: function (callback, route) {

			// Before and after are not real routes
			if (route === 'before' || route === 'after') {
				return;
			}


			// Add an event to the router with the name of the route
			// and have it trigger an event with the name of the route
			// when that route is called.
			if (route !== '*') {
				this.router.route(route, route);
			}


			// Get before and after callbacks for the routes
			var beforeCallback = this.routes.before || function() {},
				afterCallback = this.routes.after || function() {};


			// Build the callback
			var routeCallback = new RouteCallback(route, _.bind(beforeCallback, this), _.bind(callback, this), _.bind(afterCallback, this));


			// Add the listener
			this.listenTo(this.router, 'route' + (route === '*' ? '' : ':' + route), routeCallback);
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
			else if (this[name]) {
				obj = this[name];
			}
			else if (this.getChild(name)) {
				obj = this.getChildView(name)
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
		 * Setup the asset loader
		 */
		_setupLoader: function () {

			this._loader = new Loader();
			this.listenTo(this._loader, 'loaded', this.onLoaderLoaded);
		},


		/**
		 * Setup the children collection based on the child array of definitions
		 */
		_setupChildrenCollection: function () {

			var childrenCollection = this.viewModel.get('children');


			// New collection listeners
			this.listenTo(childrenCollection, 'loaded', this.onChildLoaded);


			// If there are no children to load, trigger the loaded event now
			if (this.children.length === 0) {
				this.viewModel.get('loadedComponents').children = true;
				this.trigger('childrenLoaded', this);
			}


			// Any of the child properties that are functions should be interpreted now
			this.children = _.map(this.children, this._parseChildProperties, this);


			// Loop through 'em all, let God sort 'em out
			_.each(this.children, childrenCollection.addFromDefinition, childrenCollection);
		},


		/**
		 * Parse child properties that are functions
		 * @param {Object} child
		 */
		_parseChildProperties: function (child) {

			var newChild = {};

			_.each(child, function (value, key) {
				if (typeof value === 'function' && key !== 'view') {
					newChild[key] = value.call(this);
				}
				else {
					newChild[key] = value;
				}
			}, this);

			return newChild;
		},


		/**
		 * Go back a page
		 */
		back: function () {
			window.history.back();
		},


		/**
		 * Link to a page
		 * @param {Object} e
		 */
		linkElement: function (e) {

			e.preventDefault();

			var href = $(e.currentTarget).attr('href');

			this.router.link(href);
		}
	});


	return V;
});