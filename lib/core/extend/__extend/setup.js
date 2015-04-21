globalScope = this; //globalScope is set right here as the first line of the package for all files in the package to use

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
	
	addOnBeforeStartup: function() {
		var p = this.proto.isUltimatePrototype ? this.proto : this.proto.prototype; //only protos have event system
		p.on('beforeStartup', this.methods.onBeforeStartup.bind(this.proto)); //possibly bind statically to class
	},
	addOnStartup: function() {
		var p = this.proto.isUltimatePrototype ? this.proto : this.proto.prototype; //only protos have event system
		p.on('startup', this.methods.onStartup.bind(this.proto)); //possibly bind statically to class
	},
	
	onBeforeStartup: function() {
		if(this.proto.hasOwnProperty('abstract')) return; 
		this.proto.emit('beforeStartup');
		this.proto.class.emit('beforeStartup');
	},
	onStartup: function() {
		if(this.proto.hasOwnProperty('abstract')) return;
		Meteor.startup(function() {
			this.emit('startup');
			this.class.emit('startup');
		}.bind(this.proto));
	}
};

