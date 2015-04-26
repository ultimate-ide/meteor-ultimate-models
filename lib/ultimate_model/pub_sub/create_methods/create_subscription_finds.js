UltimateModel.extend({
	createClassMethods: function(name, sub, collection) {	
		this.class[name] = function(selector, options) { //create function, eg: Orders.recent();
			selector = _.extend({}, sub.selector, selector);
			options = _.extend({}, sub, options);
			
			var findName = options.limit == 1 ? 'findOne' : 'find';
			
			return collection[findName](selector, options);
		};
	}
});