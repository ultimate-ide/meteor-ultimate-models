Ultimate('UltimateUtilities').extends({}, {
	extractConfig: function(config, Class, userId) {
		Class = UltimateUtilities.classFrom(Class);

		var context;
		if(Class && Class.isUltimate) context = Class.isUltimatePrototype ? Class : Class.prototype;

		if(_.isFunction(config)) config = config.call(context, Ultimate.userId(userId));
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