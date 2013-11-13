/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'facebook',
	'twitter',
	'loomutils/helpers/analytics',
	'config'
], function ($, Backbone, _, Facebook, Twitter, Analytics, config) {

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
		initialize: function () {

			Facebook.init({
				'appId': config.facebook.appID,
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

			var config = _.extend({}, {
				method: 'feed',
				link: window.location.toString(),
				name: this.config.facebook.name,
				caption: this.config.facebook.caption,
				description: '',
				picture: this.config.baseURL + this.config.facebook.picture
			}, params);

			Facebook.ui(config, function (response) {
				Analytics.trackSocial('facebook', 'feed dialog', response);
			});
		},


		/**
		 * Open a pinterest dialogue
		 * @param {Object} params The object of dialog parameters
		 */
		pinterestDialog: function (params) {

			var url = params.url ? escape(params.url): escape(window.location.toString()),
				media = params.media ? encodeURIComponent(params.media): encodeURIComponent(this.config.baseURL + this.config.pinterest.media),
				description = params.description ? encodeURIComponent(params.description): encodeURIComponent(this.config.pinterest.description);

			var config = _.extend({}, {
				method: 'feed',
				link: window.location.toString(),
				name: this.config.facebook.name,
				caption: this.config.facebook.caption,
				description: '',
				picture: this.config.baseURL + this.config.facebook.picture
			}, params);

			window.open('http://pinterest.com/pin/create/button/?url=' + url + '&media=' + media + '&description=' + description, '_blank', 'width=650,height=400');
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

	return new S();
});