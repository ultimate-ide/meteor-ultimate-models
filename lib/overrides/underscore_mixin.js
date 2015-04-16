_.mixin({
  mapObject: function(obj, func, context) {
		var newObj = {};
	
		_.each(obj, function(v, k) {
			newObj[k] = func.call(context || obj, v, k);
		});
	
		return newObj;
	},
	filterObject: function(obj, isTrue, ctx, transform, transformCtx) {
		var newObj = {};

		ctx = ctx || obj;
		transformCtx = transformCtx || ctx;
		
		_.each(obj, function(v, k) {
			if(isTrue.call(ctx, v, k)) newObj[k] = transform ? transform.call(transformCtx, v, k) : v;
		});
	
		return newObj;
	},
	invokeNext: function(objects, method, ctx) {
		var callNext,
			args = _.toArray(arguments).slice(3);
		
		args = _.isArray(args[0]) ? args[0] : args;
			
		_.some(objects, function(obj) {
			if(callNext === false) return true;
			else callNext = obj[method].apply(ctx || obj, args);
		});
		
		return callNext;
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
	},
	lastObjectFromArguments: function(arr) {
		var obj = _.arrayLastValue(arr);

		if(_.isObject(obj)) return _.isArray(arr) ? arr.pop() : obj;
		else return null;
	}
});
