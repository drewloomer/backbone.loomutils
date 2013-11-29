/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'epoxy'
], function ($, Backbone, _, Epoxy) {

	var M = Epoxy.Model.extend({

		blacklist: {},

		whitelist: {},

		toJSON: function (options) {

			var json = {};

			options = options || {};

			if (options.mode) {
				if (this.whitelist[options.mode]) {
					json = _.pick(_.clone(this.attributes), this.whitelist[options.mode]);
				}
				else if (this.blacklist[options.mode]) {
					json = _.omit(_.clone(this.attributes), this.blacklist[options.mode]);
				}
				else {
					json = _.clone(this.attributes);
				}
			}
			else {
				json = _.clone(this.attributes);
			}

			if (options.recursive === true) {
				_.each(json, function (object, key) {
					if (object && object.toJSON && typeof object.toJSON === 'function') {
						json[key] = object.toJSON(options);
					}
				});
			}

			return json;
		}
	});

	return M;
});