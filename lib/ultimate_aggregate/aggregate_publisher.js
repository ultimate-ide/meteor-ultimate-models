Ultimate('UltimateAggregatePublisher').extends({
	construct: function(publisher, aggregates, ModelClass) {
		this.publisher = publisher;
		this.aggregates = aggregates;
		
		this.modelClass = UltimateUtilities.classFrom(ModelClass);
		this.collection = this.modelClass.collection;
		
		this.observers = [];
		this._publishedIds = [];
		this.onStop();
	},
	
	
	start: function() {
		this.stopAllObservers();
		
		_.each(this.aggregates, function(agg) {
			if(_.isObject(agg.aggregates)) agg = this._createBasicAggregate(name, agg.selector); //basic aggregates set at subscribe time via: Model.sum('field').subscribe()
			else agg = this._getAggregate(agg); //names of defined aggregates

			this.update(agg);
			if(agg.reactive !== false) this.observe(agg);
		}, this);	
	},
	update: function(agg) {
		var result = this.exec(agg, this.collection, this.fk); //this.fk == undefined in CollectionPublisher
		this.store(result, agg);
	},
	exec: function(agg, collection, fk) {
		var group = {_id: null, result: {}};
		
		if(fk) group._id = '$'+fk; //fk provided groupBy class method & AggregateRelationsPublisher	
		
		if(agg.operator == 'count') group.result.$sum = 1;
		else group.result['$'+agg.operator] = '$'+agg.field; //count handled by default
			
		var pipeline = [
			{$match: agg.selector || {}},
			{$group: group}
		];

		var res = collection.aggregate(pipeline);
		return fk ? res : res[0].result;
	},
	observe: function(agg) {
		var initializing = true;
		
		var observer = this.cursor(agg).observe({
			added: function() {
				if(!initializing) this.update(agg);
			}.bind(this),
			changed: this.update.bind(this, agg)
		});
		
		initializing = false;
		
		var removalObserver = this.removalCursor(agg).observe({
			added: function() {
				console.log('REMOVAL CURSOR: REMOVED', agg);
				if(!initializing) this.update(agg);
			}.bind(this)
		});
		
		this.observers.push({observer: observer, removalObserver: removalObserver});
	},
	removalCursor: function(agg) {
		var selector = agg.selector ? agg.selector : {};
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
		var agg = this.modelClass.prototype.aggregates[name]; //agg object doubles as selector
		agg = UltimateUtilities.extractConfig(agg, this.modelClass.prototype);

		agg.collection = this.collection._name;
		
		if(selector) agg.selector = _.extend({}, agg.selector, selector);
		
		return agg;
	},
	_createBasicAggregate: function(agg) { //for sum/avg/min/max/count
		agg.collection = this.collection._name;
		return agg;
	}
});