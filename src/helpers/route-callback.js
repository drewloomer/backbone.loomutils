/*global define*/

define(['underscore'], function (_) {

	'use strict';

	var RouteCallback = function () {

		var route = _.first(arguments),
			callbacks = _.without(arguments, route),
			len = callbacks.length;

		return function () {
			var i = 0;
			for (i; i < len; i+=1) {
				if (typeof callbacks[i] === 'function') {
					if (callbacks[i](route) === false) {
						return false;
					}
				}
			}
		};
	};

	return RouteCallback;
});