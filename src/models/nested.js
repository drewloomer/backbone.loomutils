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
					json = _.pick(Epoxy.Model.prototype.toJSON.call(this, options), this.whitelist[options.mode]);
				}
				else if (this.blacklist[options.mode]) {
					json = _.omit(Epoxy.Model.prototype.toJSON.call(this, options), this.blacklist[options.mode]);
				}
				else {
					json = Epoxy.Model.prototype.toJSON.call(this, options);
				}
			}
			else {
				json = Epoxy.Model.prototype.toJSON.call(this, options);
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