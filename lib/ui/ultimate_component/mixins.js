UltimateComponent.extend({
	setupMixins: function() {	
		this._assignMixinMethods();
		this._assignMixinHelpers();
		this._assignMixinEvents();
		this._assignMixinCallbacks();
	},
	_extractMixins: function(mixin) {
		var mixins = [].concat(mixin);
		return _.map(mixins, function(mixin) {
			return mixin.prototype;
		});
	},
	_assignMixinMethods: function() {
		var mixins = var mixins = this._extractMixins(this.mixin);
		
		_.each(mixins, function(mixin) {
			for(var prop in mixin) {
				if(mixin.hasOwnProperty(prop)) this.___proto[prop] = mixin[prop];
			}
		}.bind(this));
	},
	_assignMixinHelpers: function() {
		var mixins = var mixins = this._extractMixins(this.mixinHelpers);
		
		_.each(mixins, function(mixin) {
			_.extend(this.___proto, mixin.getHelpers());
		}.bind(this));
	},
	_assignMixinEvents: function() {
		var mixins = var mixins = this._extractMixins(this.mixinEvents);
		
		_.each(mixins, function(mixin) {
			_.extend(this.___proto, mixin.getEvents());
		}.bind(this));
	},
	_assignMixinCallbacks: function() {
		var mixins = var mixins = this._extractMixins(this.mixinCallbacks);
		
		_.each(mixins, function(mixin) {
			this.___proto.created = mixin.created;
			this.___proto.rendered = mixin.rendered;
			this.___proto.destroyed = mixin.destroyed;
			
			this.___proto.autorun = mixin.autorun;
			this.___proto.subscribe = mixin.subscribe;
			this.___proto.subscribeLimit = mixin.subscribeLimit;
		}.bind(this));
	}
});