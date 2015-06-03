Ultimate('UltimateClientPublisherDuck').extends({
	construct: function(subscriptionCache) {
		this._subscriptionCache = subscriptionCache;
		this.userId = Meteor.userId();
		this.initCache();
	},
	
	
	initCache: function() {
		var cache = this.get();
		
		if(!cache) this.reset();
		else this.rebuild(cache);
	},
	rebuild: function(cache) {
		_.each(cache, function(objects, name) {
			var collection = Ultimate.collections[name]._collection;
			
			_.each(objects, function(obj, id) {
				var model = collection.findOne(id);

				if(model) {
					delete obj._id;
					collection.update(id, obj);
				}
				else {
					obj._id = id;
					collection.insert(obj)
				}
			});
		});
		
		this.ready();
	},
	getCachedIdsByCollection: function() {
		return _.mapObject(this.get(), function(modelsMappedById) {
			return _.keys(modelsMappedById);
		});
	},
	
	added: function(collection, id, fields) {
		var cache = this.get();
		
		delete fields._originalDoc;

		if(!cache[collection]) cache[collection] = {};
		cache[collection][id] = fields;
			
		this.set(cache);
	},
	removed: function(collection, id) {
		var cache = this.get();
		
		delete cache[collection][id];
		
		this.set(cache);
	},
	changed: function(collection, id, fields) {
		var cache = this.get();
		
		_.extend(cache[collection][id], fields);
		
		this.set(cache);
	},
	
	
	set: function(data) {
		var key = this.key();
		SessionStore.set(key, data);
	},
	get: function() {
		var key = this.key();
		return SessionStore.get(key);
	},
	key: function() {
		return EJSON.stringify(this._subscriptionCache.id);
	},
	
	
	stop: function() {
		this._subscriptionCache.stop();
		this.stopAggregateCacheObserver();

		_.each(this._onStopCallbacks, function(callback) {
			callback();
		});
	},
	ready: function() {
		this._subscriptionCache.onReady();
	},
	reset: function() {
		this.set({});
	},


	onStop: function(callback) {
		this._onStopCallbacks = this._onStopCallbacks || [];
		this._onStopCallbacks.push(callback);
	},


	//non-optimal way of dealing with unique aspects aggregates where a client side duck can't call Collection.aggregate()
	observeUltimateAggregates: function(selector) {
		var self = this;

		this.stopAggregateCacheObserver();

		this._aggregateCacheObserver = UltimateAggregates.find(selector).observe({
			added: function(doc) {
				self.added('ultimate_aggregates', doc._id, doc);
			},
			changed: function(doc) {
				self.changed('ultimate_aggregates', doc._id, doc);
			},
			removed: function(doc) {
				self.removed('ultimate_aggregates', doc._id);
			}
		});
	}, 
	stopAggregateCacheObserver: function() {
		if(this._aggregateCacheObserver) this._aggregateCacheObserver.stop();
	}
});