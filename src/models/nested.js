/*global define*/
'use strict';

define([
	'jquery',
	'backbone',
	'underscore',
	'epoxy'
], function ($, Backbone, _, Epoxy) {

	var M = Epoxy.Model.extend({

		toJSON: function (recursive) {
			var objects = Epoxy.Model.prototype.toJSON.apply(this, arguments);

			if (recursive) {
				_.each(objects, function (object, key) {
					if (object && object.toJSON && typeof object.toJSON === 'function') {
						objects[key] = object.toJSON();
					}
				});
			}

			return objects;
		}
	});

	return M;
});