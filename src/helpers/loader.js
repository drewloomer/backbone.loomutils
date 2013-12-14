/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'imagesLoaded'
], function ($, Backbone, _, imagesLoaded) {

	'use strict';

	var L = Backbone.Model.extend({

		/**
		 * Defaults
		 * @type {Object}
		 */
		defaults: {
			'elements': [],
			'stylesheets': [],
			'images': [],
			'toLoadCount': 0,
			'loadedCount': 0,
			'errorCount': 0,
			'ignoreErrors': true
		},


		/**
		 * Initialize the helper
		 */
		initialize: function () {

			this.on('loaded', this.onLoaded);
		},


		/**
		 * Add a value to one of the lists
		 * @param {String} name
		 * @param {Mixed} value
		 */
		addTo: function (name, value) {

			// Get the values and remove this value if it's already in there
			var values = _.without(this.get(name), value);
			values.push(value);

			// Add the value to the list
			this.set(name, values);
		},


		/**
		 * Add an element
		 * @param {Object} el
		 */
		addElement: function (el) {

			this.addTo('elements', el);
		},


		/**
		 * Add elements
		 * @param {Object} els
		 */
		addElements: function (els) {

			_.each(els, this.addElement);
		},


		/**
		 * Add an image
		 * @param {Object} image
		 */
		addImage: function (image) {

			this.addTo('images', image);
		},


		/**
		 * Add images
		 * @param {Object} images
		 */
		addImages: function (images) {

			_.each(images, this.addImage);
		},


		/**
		 * Add an stylesheet
		 * @param {Object} stylesheet
		 */
		addStylesheet: function (stylesheet) {

			this.addTo('stylesheets', stylesheet);
		},


		/**
		 * Add stylesheets
		 * @param {Object} stylesheets
		 */
		addStylesheets: function (stylesheets) {

			_.each(stylesheets, this.addStylesheet);
		},


		/**
		 * Load everything
		 */
		load: function () {

			// Listen for changes on the loaded count
			this.on('change:loadedCount', this.onLoadedCountChange);


			// Determine how many things we need to load
			this.set('toLoadCount', this.get('elements').length + this.get('stylesheets').length + this.get('images').length);
			this.set('errorCount', 0);
			this.set('loadedCount', 0);


			// If we have nothing to load, we're already done
			if (this.get('toLoadCount') === 0) {
				this.trigger('loaded');
			}


			// Load 'em!
			this.loadElements();
			this.loadStylesheets();
			this.loadImages();
		},


		/**
		 * Load an elements content
		 * @param {Object} el
		 */
		loadElement: function (el) {

			imagesLoaded(el, _.bind(this.onElementLoaded, this));
		},


		/**
		 * Load all of the elements' content
		 */
		loadElements: function () {

			_.each(this.get('elements'), this.loadElement, this);
		},


		/**
		 * Load an image
		 * @param {String} url
		 */
		loadImage: function (url) {

			var img = new Image();

			// Callbacks
			img.onload = _.bind(this.onImageLoaded, this);
			img.onerror = _.bind(this.onImageError, this);


			// Image starts loading now
			img.src = url;


			// Image is complete already if cached
			if (img.complete) {
				this.onImageLoaded();
			}
		},


		/**
		 * Load all of the images
		 */
		loadImages: function () {

			_.each(this.get('images'), this.loadImage, this);
		},


		/**
		 * Load all assets from the main stylessheet
		 * @param {String} stylesheet The url
		 */
		loadStylesheet: function (stylesheet) {

			// Match the path so we can load relative images
			var pathDetails = this._getFilePathDetails(stylesheet);


			// Get the stylesheet
			$.get(stylesheet).done(_.bind(function (data) {

				// Array of matches
				var re = /(url\(("|'|))([^)'"]+)(("|'|)\))/gi,
					matches = data.match(re);


				// Loop through the matches
				_.each(matches, function (match) {

					// Find each src
					var re = /(url\(("|'|))([^)'"]+)(("|'|)\))/i,
						subMatch = match.match(re);

					if (subMatch.length && subMatch[3]) {
						var file = pathDetails.path + subMatch[3];
						this.loadImage(file);
					}
				}, this);
			}, this));
		},


		/**
		 * Load all of the stylesheets
		 */
		loadStylesheets: function () {

			_.each(this.get('stylesheets'), this.loadStylesheet, this);
		},


		/**
		 * Get the path to a file
		 * @param {String} url
		 * @return {Object}
		 */
		_getFilePathDetails: function (url) {

			var isRelative = url.search(/(http:\/\/|https:\/\/|\/\/)/i) === -1,
				directories = isRelative ? url.split('/') : url.match(/([^\/]{1,})/gi),
				directoriesDepth = isRelative ? directories.length - 1 : directories.length - 2,
				path = '',
				i = 0;


			// Add the path pieces
			for (i; i < directoriesDepth; i+=1) {
				path = path + directories[i] + '/';
			}


			return {
				isRelative: isRelative,
				directories: directories,
				directoriesDepth: directoriesDepth,
				path: path
			};
		},


		/**
		 * When an element is loaded, increment the load count
		 */
		onElementLoaded: function () {

			this.set('loadedCount', this.get('loadedCount') + 1);
		},


		/**
		 * When an image is loaded, increment the load count
		 */
		onImageLoaded: function () {

			this.set('loadedCount', this.get('loadedCount') + 1);
		},


		/**
		 * When an image errors
		 */
		onImageError: function () {

			this.set('errorCount', this.get('errorCount') + 1);
		},


		/**
		 * When the loaded count changes
		 */
		onLoadedCountChange: function () {

			var loadedCount = this.get('ignoreErrors') ? this.get('loadedCount') + this.get('errorCount') : this.get('loadedCount');

			if (loadedCount === this.get('toLoadCount')) {
				this.trigger('loaded');
			}
		},


		/**
		 * When we're all loaded
		 */
		onLoaded: function () {

			this.off('change:loadedCount', this.onLoadedCountChange);
		}
	});

	return L;
});