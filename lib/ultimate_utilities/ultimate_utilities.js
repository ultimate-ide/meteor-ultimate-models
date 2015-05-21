Ultimate('UltimateUtilities').extends({}, {
	extractConfig: function(config, Class) {
		var proto = Class.isUltimatePrototype ? Class : Class.prototype;

		if(_.isFunction(config)) config = config.call(proto, Ultimate.userId());
		return config;
	},
	pickCollectionOptions: function(options) {
		return _.pick(options || {}, 'sort', 'limit', 'fields', 'skip');
	}
});