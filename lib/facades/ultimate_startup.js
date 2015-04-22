Ultimate('UltimateStartup').extends(UltimateFacade, {
	abstract: true,
	deniedMethods: ['autorun', 'subscribe', 'subscribeLimit', 'onStartup'], //handled by runReactiveMethods & Setup
	mixins: [Meteor.isClient ? UltimateReactive : null],
	
	onFacadeStartup: function() {	
		var methods = this.getStartupMethods();
		
		_.each(methods, function(method) {
			Meteor.startup(method);
		});
		
		if(this.runReactiveMethods) this.runReactiveMethods(); //only client can run the reactive autorun/subscribe/subscribeLimit methods
	},
	
	
	getStartupMethods: function() {
		var methods = this.getMethods();
	
		if(this.autorun) methods.autorun = this._getAutorun();
		if(this.subscribe) methods.subscribe = this._getSubscribe();
		if(this.subscribeLimit) methods.subscribeLimit = this._getSubscribeLimit();
		
		return methods;
	}
});