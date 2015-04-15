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
		}, this);
	},
	_assignMixinEvents: function() {
		var mixins = this._extractMixins(this.mixinEvents),
			allEvents = {};
			
		mixins.unshift(this);
		
		_.each(mixins, function(mixin) {
			_.each(mixin.getEvents(), function(eventHandler, name) {
				if(!allEvents[name]) allEvents[name] = [];
				allEvents[name].push(eventHandler);
			}, this);
		}, this);
		
		
		_.each(allEvents, function(eventHandlers, name) {
			this.___proto[name] = function() {
				return _.invokeNext(eventHandlers, 'apply', this, _.toArray(arguments)); //may return false as on regular events
			};
		});
	},
	_assignMixinCallbacks: function() {
		var mixins = this._extractMixins(this.mixinCallbacks);
		
		if(this.onCreated) this.___proto.onCreatedCallbacks.push(this.onCreated);
		if(this.onRendered) this.___proto.onRenderedCallbacks.push(this.onRendered);
		if(this.onDestroyed) this.___proto.onDestroyedCallbacks.push(this.onDestroyed);
		
		_.each(mixins, function(mixin) {
			if(mixin.onCreated) this.___proto.onCreatedCallbacks.push(mixin.onCreated);
			if(mixin.onRendered) this.___proto.onRenderedCallbacks.push(mixin.onRendered);
			if(mixin.onDestroyed) this.___proto.onDestroyedCallbacks.push(mixin.onDestroyed);
			
			if(mixin.autorun) this.___proto.autorunCallbacks.push(mixin.autorun);
			if(mixin.subscribe) this.___proto.subscribeCallbacks.push(mixin.subscribe);
			if(mixin.subscribeLimit) this.___proto.subscribeLimitCallbacks.push(mixin.subscribeLimit);
		}, this);
	},
	
	
	_extractMixins: function(mixin) {
		var mixins = [].concat(mixin);
		return _.map(mixins, function(mixin) {
			return mixin.prototype;
		});
	}
});