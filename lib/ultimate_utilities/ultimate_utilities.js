Ultimate('UltimateUtilities').extends({}, {
	extractConfig: function(config, Class) {
		var proto = Class.isUltimatePrototype ? Class : Class.prototype;

		if(_.isFunction(config)) config = config.call(proto, Ultimate.userId());
		config = UltimateClone.deepClone(config);

		return config;
	},
	classFrom: function(Class) {
		return _.isString(Class) ? Ultimate.classes[Class] : Class;
	},
	pickCollectionOptions: function(options) {
		return _.pick(options || {}, 'sort', 'limit', 'fields', 'skip');
	}
});