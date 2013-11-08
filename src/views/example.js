/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'views/base',
	'models/photowall',
	'templates/main',
	'views/home/base',
	'views/create/base',
	'views/admin/base',
	'views/upload/base'
], function ($, Backbone, _, BaseView, photowall, Template, HomeView, CreateView, AdminView, UploadView) {

	var V = BaseView.extend({

		/**
		 * Template
		 * @type {Function}
		 */
		template: Template,


		/**
		 * Section ID
		 * @type {String}
		 */
		id: 'main',


		/**
		 * Tag name
		 * @type {String}
		 */
		tagName: 'section',


		/**
		 * The photowall model
		 * @type {Object}
		 */
		model: photowall,


		/**
		 * Child views
		 * @type {Array}
		 */
		children: [
			{
				view: HomeView,
				target: '#home',
				replace: true,
				role: 'primary'
			},
			{
				view: CreateView,
				target: '#create',
				replace: true,
				role: 'primary'
			},
			{
				view: AdminView,
				target: '#admin',
				replace: true,
				role: 'primary'
			},
			{
				view: UploadView,
				target: '#upload',
				replace: true,
				role: 'primary'
			}
		],


		/**
		 * Routes
		 * @type {Object}
		 */
		routes: {
			home: function () {
				this.showChild('home');
			},
			create: function () {
				this.showChild('create').showDefaultChild();
			},
			admin: function () {

				this.router.redirect('admin/manage');
			},
			upload: function () {
				if (!this.model.get('connected')) {
					return this.router.redirect('home');
				}
				this.showChild('upload').showDefaultChild();
			}
		},


		/**
		 * Initialize
		 */
		initialize: function () {

			BaseView.prototype.initialize.apply(this, arguments);

			this.listenTo(this.getChild('admin').get('view'), 'fileAdded', this.onFileAdded);
		},


		/**
		 * When a file is uploaded, show the crop form
		 * @param {Object} upload New instance of the upload model
		 */
		onFileAdded: function (upload) {

			this.getChild('upload').get('view').trigger('photoUploaded', upload);
			this.router.link('upload/crop');
		}
	});

	return V;
});