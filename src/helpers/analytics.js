/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'ga',
	'facebook',
	'twitter',
	'loomutils/helpers/logger'
], function ($, Backbone, _, GA, Facebook, Twitter, logger) {

	'use strict';

	var A = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(A.prototype, Backbone.Events, {

		/**
		 * The configuration
		 * @type {Object}
		 */
		config: {},


		/**
		 * Initialize the local storage
		 */
		initialize: function (params) {

			this.config = params.config || {};

			window._gaq = window._gaq || [];
			GA.push(['_setAccount', this.config.gaAccountId]);

			this.initializeFacebookListeners();
			this.initializeTwitterListeners();

			return this;
		},


		/**
		 * Fire a page track event
		 * @param page {String}
		 */
		trackPageview: function (page) {

			if (page === undefined) {
				return;
			}

			GA.push(['_trackPageview', page]);
			logger.log('trackPageview', page);

			return this;
		},


		/**
		 * Fire a generic track event
		 */
		trackEvent: function () {

			var category = arguments[0] || '',
				action = arguments[1] || '',
				label = arguments[2] || undefined,
				value = arguments[3] || undefined;

			GA.push(['_trackEvent', category, action, label, value]);
			logger.log('trackEvent', category, action, label, value);

			return this;
		},


		/**
		 * Fire a social GA event.
		 */
		trackSocial: function () {

			var network = arguments[0] || '',
				action = arguments[1] || '',
				target = arguments[2] || undefined,
				path = arguments[3] || undefined;

			GA.push(['_trackSocial', network, action, target, path]);
			logger.log('trackSocial', network, action, target, path);

			return this;
		},


		/**
		 * Track an event that is defined on an element
		 * @param {Object} el The jQuery element
		 */
		trackElement: function(el) {

			var category = el.data('category') || '',
				action = el.data('action') || 'click',
				label = el.data('label') || undefined,
				value = el.data('value') || undefined,
				network = el.data('network') || '',
				target = el.data('target') || undefined,
				path = el.data('path') || undefined;

			if ( el.data('track') === 'social' ) {
				this.trackSocial(network, action, target, path);
			}
			else if ( el.data('track') === 'page' || el.data('track') === 'pageview' ) {
				this.trackPageView(path);
			}
			else {
				this.trackEvent(category, action, label, value);
			}
		},


		/**
		 * Tracks Likes/Unlikes via FB API events
		 */
		initializeFacebookListeners: function () {

			Facebook.Event.subscribe('edge.create', _.bind(function (targetUrl) {
				this.trackSocial('facebook', 'like', targetUrl);
			}, this));

			Facebook.Event.subscribe('edge.remove', _.bind(function (targetUrl) {
				this.trackSocial('facebook', 'unlike', targetUrl);
			}, this));

			Facebook.Event.subscribe('message.send', _.bind(function (targetUrl) {
				this.trackSocial('facebook', 'send', targetUrl);
			}, this));

			return this;
		},

		/**
		 * Tracks Tweets via the twitter API
		 */
		initializeTwitterListeners: function () {

			function extractParamFromUri(uri, paramName) {

				var query, parts, params, i;

				if (!uri) {
					return;
				}

				uri = uri.split('#')[0]; // Remove anchor.
				parts = uri.split('?'); // Check for query params.
				if (parts.length === 1) {
					return;
				}

				query = decodeURI(parts[1]);

				// Find url param.
				paramName += '=';
				params = query.split('&');
				for (i = 0; i < params.length; i++) {
					if (params[i].indexOf(paramName) === 0) {
						return window.unescape(params[i].split('=')[1]);
					}
				}
			}

			Twitter.events.bind('tweet', _.bind(function (event) {

				if (event) {
					var targetUrl;
					if ( event.target && event.target.label ) {
						targetUrl = event.target.label;
					}
					else if (event.target && event.target.nodeName === 'IFRAME') {
						targetUrl = extractParamFromUri(event.target.src, 'url');
					}
					else {
						targetUrl = event.target.origin + event.target.pathname;
					}

					this.trackSocial('twitter', 'tweet', targetUrl);
				}
			}, this));

			return this;
		}
	});

	return A;
});