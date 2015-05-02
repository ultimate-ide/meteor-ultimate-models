UltimateComponentParent.extend({
	setupMixins: function() {	
		this._assignMixinHelpers();
		this._assignMixinEvents();
		this._assignMixinCallbacks();
		//generic mixins assigned from this.mixins handled by UltimateClass code
	},
	

	_assignMixinHelpers: function() {
		var mixins = this._extractMixins(this.mixinHelpers);
		
		mixins.shift();
		mixins.pop(this.getPrototype()); //overwrite mixin helpers
		
		_.each(mixins, function(mixin) {
			_.extend(this, mixin.getHelpers());
		}, this);
	},
	_assignMixinEvents: function() {
		var mixins = this._extractMixins(this.mixinEvents),
			events = {};
			
		_.each(mixins, function(mixin) {
			_.each(mixin.getEvents(), function(eventHandler, name) {
				if(!events[name]) events[name] = [];
				events[name].push(eventHandler);
			}, this);
		}, this);
		
		this._resolvedEvents = events;
	},
	_assignMixinCallbacks: function() {
		var mixins = this._extractMixins(this.mixinCallbacks),	
			autorunCallbacks = [],
			subscribeCallbacks = [],
			subscribeLimitCallbacks = [];

		
		_.each(mixins, function(mixin) {
			if(mixin.onCreated) this.onCreatedCallbacks.push(mixin.onCreated);
			if(mixin.onRendered) this.onRenderedCallbacks.push(mixin.onRendered);
			if(mixin.onDestroyed) this.onDestroyedCallbacks.push(mixin.onDestroyed);
			
			if(mixin.ar) autorunCallbacks = autorunCallbacks.concat(this.__combineHandlers(mixin.ar));
			if(mixin.sub) subscribeCallbacks = subscribeCallbacks.concat(this.__combineHandlers(mixin.sub));
			if(mixin.subLimit) subscribeLimitCallbacks = subscribeLimitCallbacks.concat(this.__combineHandlers(mixin.subLimit));
		}, this);

		this.ar = autorunCallbacks;
		this.sub = subscribeCallbacks;
		this.subLimit = subscribeLimitCallbacks;
	},
	
	
	_extractMixins: function(mixin) {
		return [this].concat(mixin).map(function(mixin) {
			return mixin.getPrototype();
		});
	}
});