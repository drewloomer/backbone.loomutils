/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'facebook',
	'twitter',
	'googleplus'
], function ($, Backbone, _, Facebook, twitter, googlePlus) {

	'use strict';

	var S = function () {
		this.initialize.apply(this, arguments);
	};

	_.extend(S.prototype, Backbone.Events, {

		/**
		 * The configuration
		 * @type {Object}
		 */
		config: {},


		/**
		 * Facebook SDK
		 * @type {Object}
		 */
		fb: Facebook,


		/**
		 * Initialize the local storage
		 */
		initialize: function (params) {

			params = params || {};

			this.config = params.config || {};

			Facebook.init({
				'appId': this.config.facebook.appID,
				'xfbml': true,
				'status': false
			});

			return this;
		},


		/**
		 * Open a facebook dialog
		 * @param {Object} params The object of dialog parameters
		 */
		facebookDialog: function (params) {

			params = params || {};

			var method = params.method || 'feed',
				conf = {};

			if (method === 'send') {
				conf = {
					method: method,
					app_id: this.config.facebook.appID,
					display: params.display || 'popup',
					link: params.link || window.location.toString()
				};
			}
			else {
				conf = {
					method: method,
					display: params.display || 'popup',
					link: params.link || window.location.toString(),
					name: params.name ? params.name : (this.config.facebook.name || ''),
					caption: params.caption ? params.caption : (this.config.facebook.caption || ''),
					description: params.description ? params.description : (this.config.facebook.description || ''),
					picture: params.picture || (this.config.baseURL + this.config.facebook.picture)
				};
			}

			Facebook.ui(conf, _.bind(function (response) {
				if (typeof params.success === 'function') {
					params.success(response);
				}
				this.trigger(conf.method + ' dialog', response);
			}, this));
		},


		/**
		 * Open a pinterest dialogue
		 * @param {Object} params The object of dialog parameters
		 */
		pinterestDialog: function (params) {

			var url = params.url ? escape(params.url): escape(window.location.toString()),
				media = params.media ? encodeURIComponent(params.media): encodeURIComponent(config.baseURL + config.pinterest.media),
				description = params.description ? encodeURIComponent(params.description): encodeURIComponent(config.pinterest.description);

			window.open('http://pinterest.com/pin/create/button/?url=' + url + '&media=' + media + '&description=' + description, '_blank', 'width=650,height=400');
		},


		/**
		 * Post via Google+
		 */
		googlePlusPost: function (params) {

			var url = params.url ? escape(params.url): escape(window.location.toString());

			window.open('https://plus.google.com/share?url=' + url + '&hl=en-US', '_blank', 'width=650,height=400');
		},


		/**
		 * Create a URL to a twitter intent
		 * @param {Object} params
		 * @return {String}
		 */
		twitterTweetURL: function(params) {

			var urlText = encodeURIComponent(params.text);

			return 'https://twitter.com/intent/tweet?text=' + urlText;
		}
	});

	return S;
});