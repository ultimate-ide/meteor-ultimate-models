GLOBALSCOPE = this; //GLOBALSCOPE is set right here as the first line of the package for all files in the package to use

Setup = function Setup(proto, methods) {
	this.proto = proto;
	this.methods = methods;
};

Setup.prototype = {
	mixins: function() {
		var mixins = [].concat(this.methods.mixins);
		
		_.each(mixins, function(mixin) {
			if(!mixin) return; //a null mixin may possible be supplied like in UltimateStartup
			
			UltimateClone.deepExtendUltimate(this.proto, mixin.prototype);
			if(this.proto.___proto) UltimateClone.deepExtendUltimate(this.proto.class, mixin); //extend statics if added by .extends()
		}, this);
	},
	
	
	onBeforeStartup: function() {
		if(this.proto.isAbstract()) return; 
		this.proto.emit('beforeStartup');
	},
	onBeforeStartupStatic: function() {
		if(this.proto.isAbstract()) return; 
		this.proto.class.emit('beforeStartup');
	},
	onStartup: function() {
		if(this.proto.isAbstract()) return;
		
		Meteor.startup(function() {
			this.emit('startup');
			this.class.emit('startup');
		}.bind(this.proto));
	}
};

