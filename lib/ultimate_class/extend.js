_.extend(UltimateClass, {
  	extend: function(methods) {
    	Ultimate.setupMethods(this.prototype, methods);
  	},
	extendStatic: function(methods) {
		Ultimate.setupMethods(this, methods);
	},
	
	
	extendServer: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.setupMethods(this.prototype, methods);
	},
	extendServerStatic: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.setupMethods(this, methods);
	},
	
	
	extendClient: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.setupMethods(this.prototype, methods);
	},
	extendClientStatic: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.setupMethods(this, methods);
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