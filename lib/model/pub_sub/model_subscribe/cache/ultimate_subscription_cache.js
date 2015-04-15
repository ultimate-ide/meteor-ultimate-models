Ultimate('UltimateSubscriptionCache').extends({
	construct: function(subscription, ModelClass, callbacks) {
		this._subscription = subscription;
		this.modelClass = ModelClass;
		this._callbacks = callbacks;
		
		this._publisher = new UltimateClientPublisherDuck(this); //triggers this.onReady() if cached data found in localStorage 
	},
	cache: function(options, relations, aggregates) {
		this._options = options;
		this._relations = relations;
		this._aggregates = aggregates;
		
		this.startCaching();
	},
	
	
	startCaching: function() {
		//this._publisher will have it's duck-typed added/removed/changed() methods called, which store in localStorage
		if(!_.isEmpty(this._aggregates)) {
			new UltimateAggregateCollectionPublisher(this._publisher, this._aggregates, this.modelClass);
		}
		
		var urpf = new UltimateRelationsPublisherFactory(this._publisher);
		urpf.startPublishing(this._relations, this.modelClass, this._options.selector, this._options);
	},
	

	store: function(data) {
		SessionStore.set(EJSON.stringify(this), data);
	},
	retreive: function() {
		SessionStore.set(EJSON.stringify(this));
	},
	
	
	onReady: function() {
		this._ready = true;
		
		if(this._callbacks && this._callbacks.onReady) this._callbacks.onReady();
		else if(_.isFunction(this._callbacks)) this._callbacks();
	},
	
	
	ready: function() {
		return !!this._ready;
	},
	stop: function() {
		this._subscription.stop();
	}
	
	
	reset: function() {
		this._publisher.reset();
	}
});