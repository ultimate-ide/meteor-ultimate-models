Ultimate('UltimateAggregatePublisher').extends({
	construct: function(publisher, aggregates, ModelClass) {
		this.publisher = publisher;
		this.aggregates = aggregates;
		
		this.modelClass = ModelClass;
		this.collection = ModelClass.collection();
		
		this.observers = [];
		this.onStop();
	},
	
	
	start: function() {
		this.stopAllObservers();
		
		_.each(this.aggregates, function(agg) {
			if(_.isObject(agg.aggregates)) {
				var agg = this._createBasicAggregate(agg);
				this.update(agg);
				if(agg.reactive !== false) this.observe(agg);
			}
			else {
				_.each(agg.aggregates, function(name) { //_.isArray(agg.aggregates)
					var agg = this._getAggregate(name, agg.selector);
					this.update(agg);
					if(agg.reactive !== false) this.observe(agg);
				}, this);
			}
		}, this);	
	},
	update: function(agg, initializing) {
		if(initializing) return;
		
		var result = this.exec(agg);
		this.store(result, agg);
	},
	observe: function(agg) {
		var initializing = true;
		
		var observer = this.cursor().observe({
			added: this.update.bind(this, agg, initializing),
			changed: this.update.bind(this, agg)
		});
		
		initializing = false;
		
		var removalObserver = this.removalCursor(agg).observe({
			added: this.update.bind(this, agg)
		});
		
		this.observers.push({observer: observer, removalObserver: removalObserver});
	},
	removalCursor: function(agg) {
		var selector = agg.selector ? UltimateClone.deepClone(agg.selector) || {};
		selector.collection = this.collection._name; 
		return UltimateRemovals.find(selector, {limit: 1, sort: {updated_at: -1}});
	},
	
	
	onStop: function() {
		this.publisher.onStop(this.stopAllObservers.bind(this));
	},
	stopAllObservers: function() {
		_.each(this.observers, function(obj) {
			obj.observer.stop();
			obj.removalObserver.stop();
		});
	},
	
	_getAggregate: function(name, selector) {
		var agg = UltimateClone.deepClone(this.modelClass.prototype.aggregates[name]); //agg object doubles as selector
		agg.collection = this.collection._name;
		
		if(selector) agg.selector = _.extend({}, agg.selector, selector);
		
		return agg;
	}
	_createBasicAggregate: function(agg) { //for sum/avg/min/max/count
		agg.collection = this.collection._name;
		return agg;
	}
});