//not sure why the meteor version of underscore doesn't have this, but whatever.
_.mixin({
  mapObject: function(obj, func, context) {
		var newObj = {};
	
		_.each(obj, function(v, k) {
			newObj[k] = func.call(context, v, k);
		});
	
		return newObj;
	},
	containsSome: function(fields, some) {
		return _.some(fields, function(field) {
			return _.contains(some, field);
		});
	},
	pickAndBind: function(obj, props, context) {
		context = context || obj;
		props = [].concat(props);
		
		return _.chain(obj)
			.pick(props)
			.mapObject(function(v) {
				return _.isFunction(v) ? v.bind(context) : v;
			}).value();
	}
});

