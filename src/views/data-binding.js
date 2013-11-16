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
		},


		/**
		 * Override apply bindings to parse string data sources
		 */
		applyBindings: function () {

			var bindingSources = {};

			_.each(this.bindingSources, function (source, name) {
				if (typeof source === 'string') {
					bindingSources[name] = this.parseSourceName(source);
				}
				else {
					bindingSources[name] = source;
				}
			}, this);

			this.bindingSources = bindingSources;

			NestedView.prototype.applyBindings.apply(this, arguments);
		},


		/**
		 * Parse a source string
		 * @param {String} sourceName
		 */
		parseSourceName: function (sourceName) {

			var parts = sourceName.split('.'),
				i = 0,
				len = parts.length,
				source = this;

			for (i; i < len; i++) {
				if (source[parts[i]]) {
					source = source[parts[i]];
				}
				else if (source.get && source.get(parts[i])) {
					source = source.get(parts[i]);
				}
				else {
					source = sourceName;
					break;
				}
			}

			return source;
		}
	});

	return V;
});