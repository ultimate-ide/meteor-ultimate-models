Ultimate('UltimateStartup').extends(UltimateReactive, {
	onChildClassStartup: function() {
		var startupClass = this.createNew(),
			methods = startupClass.getMethods();
			
		_.each(methods, function(method) {
			method.call(startupClass);
		});
	},
	
	
	getMethods: function() {
		var methods = [];
	
		for(var prop in this) {
			if(this.isMethod(prop)) {
				methods.push(this[prop]);
			}
		}
	
		if(this.autorun) methods.autorun = this._getAutorun();
		if(this.subscribe) methods.subscribe = this._getSubscribe();
		if(this.subscribeLimit) methods.subscribeLimit = this._getSubscribeLimit();
		
		return methods;
	},
	isMethod: function(prop) {
		var regex = /^(autorun|subscribe|subscribeLimit)(\s|$)/;	
		return this.protoHasOwnProperty(prop) && !this.isPrivateMethod(prop) && !regex.test(prop);
	}
});