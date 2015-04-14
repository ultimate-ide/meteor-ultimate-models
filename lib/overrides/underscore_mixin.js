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
	},
	arrayLastValue: function(arr) {
		return arr[arr.length - 1];
	},
	callbackFromArguments: function(arr) {
		var callback = _.arrayLastValue(arr);

		if(_.isFunction(callback)) return _.isArray(arr) ? arr.pop() : callback;
		else return null;
	}
});

