UltimateComponent.extend({
	setupMixins: function() {	
		this._assignMixinHelpers();
		this._assignMixinEvents();
		this._assignMixinCallbacks();
		//generic mixins assigned from this.mixins handled by UltimateClass code
	},
	

	_assignMixinHelpers: function() {
		var mixins = this._extractMixins(this.mixinHelpers);
		
		_.each(mixins, function(mixin) {
			_.extend(this.___proto, mixin.getHelpers());
		}.bind(this));
	},
	_assignMixinEvents: function() {
		var mixins = this._extractMixins(this.mixinEvents);
		
		_.each(mixins, function(mixin) {
			_.extend(this.___proto, mixin.getEvents());
		}.bind(this));
	},
	_assignMixinCallbacks: function() {
		var mixins = this._extractMixins(this.mixinCallbacks);
		
		_.each(mixins, function(mixin) {
			this.___proto.onCreated = mixin.onCreated;
			this.___proto.onRendered = mixin.onRendered;
			this.___proto.onDestroyed = mixin.onDestroyed;
			
			this.___proto.autorun = mixin.autorun;
			this.___proto.subscribe = mixin.subscribe;
			this.___proto.subscribeLimit = mixin.subscribeLimit;
		}.bind(this));
	},
	
	
	_extractMixins: function(mixin) {
		var mixins = [].concat(mixin);
		return _.map(mixins, function(mixin) {
			return mixin.prototype;
		});
	}
});