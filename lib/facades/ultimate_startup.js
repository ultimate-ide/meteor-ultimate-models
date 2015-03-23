Ultimate('UltimateStartup').extends(UltimateReactive, {
	deniedMethods: ['autorun', 'subsribe', 'subscribeLimit'],
	mixins: [UltimateBind],
	
	
	onStart: function(self) {
		var methods = self.getStartupMethods();
		
		_.each(methods, function(method) {
			Meteor.onStartup(method);
		});
	},
	
	getStartupMethods: function() {
		var methods = this.getMethods();
	
		if(this.autorun) methods.autorun = this._getAutorun();
		if(this.subscribe) methods.subscribe = this._getSubscribe();
		if(this.subscribeLimit) methods.subscribeLimit = this._getSubscribeLimit();
		
		return methods;
	}
});