/*global define*/

define([
	'jquery',
	'backbone',
	'underscore',
	'loomutils/views/nested'
], function ($, Backbone, _, NestedView) {

	'use strict';

	var V = NestedView.extend({

		initialize: function () {

			NestedView.prototype.initialize.apply(this, arguments);
			this.render();
		}
	});

	return V;
});