_.extend(UltimateClass, {
  	extend: function(methods) {
    	Ultimate.addMethods(this.prototype, methods);
  	},
	extendStatic: function(methods) {
		Ultimate.addMethods(this, methods);
	},
	
	
	extendServer: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.addMethods(this.prototype, methods);
	},
	extendServerStatic: function(methods) {
		if(!Meteor.isServer) return;
		Ultimate.addMethods(this, methods);
	},
	
	
	extendClient: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.addMethods(this.prototype, methods);
	},
	extendClientStatic: function(methods) {
		if(!Meteor.isClient) return;
		Ultimate.addMethods(this, methods);
	},


  mixinMultiple: function(mixins) {
    mixins = [].concat(mixins);
    _.each(mixins, this.mixin, this);
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