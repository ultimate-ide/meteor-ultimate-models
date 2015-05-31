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
			if(_.isObject(agg)) agg = this._createAdHocAggregate(agg); //aggregate config objects
			else agg = this._getAggregate(agg); //names of defined aggregates

			this.update(agg);
			if(!Meteor.isClient) if(agg.reactive !== false) this.observe(agg); //client side publisher caching duck doesn't need to do this
		}, this);	
	},
	update: function(agg) {
		var agg = this.prepareUltimateAggregatePropsForSave(agg);
		
		//client side publisher duck responsible for observing UltimateAggregates collection & caching results
		if(Meteor.isClient) return this.publisher.observeUltimateAggregates(agg);

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

		if(_.isArray(res) && res.length === 1) return res[0].result;
		else return res;
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
	
	
	_createAdHocAggregate: function(agg) { 
		//basic aggregates (sum/avg/min/max/count) set at subscribe time 
		//via: Model.agg({field: 'cost', operator: 'sum'}).subscribe() 
		//or: Model.sum('field').subscribe()
		//but also now relations of type 'aggregate'
		agg.collection = this.collection._name;
		return agg;
	},
	_getAggregate: function(name, selector) {
		var agg = this.modelClass.prototype.aggregates[name]; //agg object doubles as selector
		agg = UltimateUtilities.extractConfig(agg, this.modelClass.prototype);

		agg.collection = this.collection._name;
		
		if(selector) agg.selector = _.extend({}, agg.selector, selector);
		
		return agg;
	}
});