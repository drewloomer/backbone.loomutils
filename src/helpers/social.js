/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'facebook',
	'twitter',
	'helpers/analytics',
	'config'
], function ($, Backbone, _, Facebook, Twitter, Analytics, Config) {

	var S = function () {
		this.initialize();
	};

	_.extend(S.prototype, Backbone.Events, {

		/**
		 * Initialize the local storage
		 */
		initialize: function () {

			Facebook.init({
				'appId': Config.facebook.appID,
				'xfbml': true
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
				name: Config.facebook.name,
				caption: Config.facebook.caption,
				description: '',
				picture: Config.baseURL + Config.facebook.picture
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
				media = params.media ? encodeURIComponent(params.media): encodeURIComponent(Config.baseURL + Config.pinterest.media),
				description = params.description ? encodeURIComponent(params.description): encodeURIComponent(Config.pinterest.description);

			var config = _.extend({}, {
				method: 'feed',
				link: window.location.toString(),
				name: Config.facebook.name,
				caption: Config.facebook.caption,
				description: '',
				picture: Config.baseURL + Config.facebook.picture
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

	return S;
});