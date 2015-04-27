_.extend(UltimateClass, {
  	extend: function(methods) {
    	Ultimate.extendMethods(this.prototype, methods);
  	},
	extendStatic: function(methods) {
		Ultimate.extendMethods(this, methods);
	},
	
	
	extendServer: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.extendMethods(this.prototype, methods);
	},
	extendServerStatic: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.extendMethods(this, methods);
	},
	
	
	extendClient: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.extendMethods(this.prototype, methods);
	},
	extendClientStatic: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.extendMethods(this, methods);
	},


	mixin: function(Parent) {
		this.mixinStatic(Parent);
		this.mixinInstance(Parent);
	},
	mixinStatic: function(Parent) {
		UltimateClone.deepExtendUltimate(this, Parent);
	},
	mixinInstance: function(Parent) {
		UltimateClone.deepExtendUltimate(this.prototype, Parent.prototype);
	}
});