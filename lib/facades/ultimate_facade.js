Ultimate('UltimateFacade').extends({
	abstract: true,
	deniedMethods: [],
	allowedMethods: [],
	
	
	onBeforeStart: function() {
		var facade = this.createNew();
		facade.emit('facadeStart');
	},
	
	onFacadeStart: function() {
		console.log('You should define an onFacadeStart method.');
	}
});

var moreMethods = {
	getMethods: function(key, mustBeFunc, fromObj, dontBindThis) {
		var fromObj = fromObj || (key ? this[key] : this);
		
		return _.chain(fromObj)
			.filterObject(function(func, prop) {
				if(this.isMethod(prop, func) && this.isFunction(prop, mustBeFunc)) return true;
			}, this)
			.mapObject(function(func, prop) {
				return _.isFunction(func) && !dontBindThis ? func.bind(this) : func;
			}, this)
			.value();
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
};

UltimateFacade.extend(moreMethods);

UltimateFacade.extendStatic(moreMethods);
UltimateFacade.extendStatic({
	onBeforeStart: function() {
		this.emit('facadeStart');
	}
});