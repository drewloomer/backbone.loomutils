/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'views/base'
], function ($, Backbone, _, BaseView) {

	var V = BaseView.extend({

		initialize: function () {

			BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		}
	});

	return V;
});