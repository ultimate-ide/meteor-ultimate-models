Ultimate('UltimateFacade').extends({
	deniedMethods: [],
	allowedMethods: [],
	
	
	onChildClassBeforeStartup: function() {
		var instantiatedObject = this.createNew();
		this.onStart(instantiatedObject);
	},
	onStart: function(instantiatedObject) {
		console.log('You must define an onStart method. It will be passed this argument:', instantiatedObject);
	},


	getMethods: function(key, mustBeFunc, fromObj, dontBindThis) {
		var fromObj = fromObj || (key ? this[key] : this);
	
		return _.mapObject(fromObj, function(func, prop) {
			if(this.isMethod(prop, func) && this.isFunction(prop, mustBeFunc)) {
				return _.isFunction(func) && !dontBindThis ? func.bind(this) : func;
			}
		}, this);
	},
	isMethod: function(prop, func) {
		return this.isStandardMethod(prop) && !this.isDeniedMethod(prop) && this.isAllowedMethod(prop);
	},
	isFunction: function(prop, mustBeFunc) {
		if(mustBeFunc) return _.isFunction(func);
		else return true;
	},
	
	isStandardMethod: function(prop) {
		return this.protoHasOwnProperty(prop) && !this.isPrivateMethod(prop);
	},
	isDeniedMethod: function(prop) {
		if(!this.deniedMethods) return true;
		else return _.contains(this.deniedMethods, prop);
	},
	isAllowedMethod: function(prop) {
		if(!this.allowedMethods) return true;
		else return _.contains(this.allowedMethods, prop);
	}
});