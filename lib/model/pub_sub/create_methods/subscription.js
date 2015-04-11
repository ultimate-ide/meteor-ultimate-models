UltimateModel.extend({
	createClassMethods: function(name, sub, collection) {	
		this.class[name] = function(selector, options) { //create function, eg: user.orders();
			selector = _.extend({}, sub.options.selector, selector);
			options = _.extend({}, sub.options, options);
			
			var findName = options.limit == 1 ? 'findOne' : 'find';
			
			return collection[findName](selector, options);
		};
	}
});