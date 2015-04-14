Ultimate('UltimateClientPublisherDuck').extends({
	construct: function(subscriptionCache) {
		this._subscriptionCache = subscriptionCache;
		this.initStorage();
	},
	
	
	initStorage: function() {
		var storage = this.get();
		
		if(!storage) this.reset();
		else this.rebuild(storage);
	},
	rebuild: function(storage) {
		_.each(storage, function(objects, name) {
			var collection = Ultimate.collections[name]._collection;
			
			_.each(objects, function(obj, id) {
				obj._id = id;
				collection.insert(obj);
			});
		});
		
		this.ready();
	},
	
	
	added: function(collection, id, fields) {
		var storage = this.get();
		
		if(!storage[collection]) storage[collection] = {};
		storage[collection][id] = fields;
		
		if(collection == 'ultimate_aggregates') this._deleteStaleAggregate(storage, fields.fk);
			
		this.set(storage);
	},
	removed: function(collection, id) {
		var storage = this.get();
		
		delete storage[collection][id];
		
		this.set(storage);
	},
	changed: function(collection, id, fields) {
		var storage = this.get();
		
		_.extend(storage[collection][id], fields);
		
		this.set(storage);
	},
	
	
	_deleteStaleAggregate: function(storage) {
		_.some(storage.ultimate_aggregates, function(obj, id) {
			if(obj.fk == fk) return delete storage.ultimate_aggregates[id];
		});
	};
	
	
	set: function(data) {
		var key = this.key();
		SessionStore.set(key, data);
	},
	get: function() {
		var key = this.key();
		return SessionStore.get(key);
	},
	key: function() {
		return EJSON.stringify(this._cache);
	},
	
	
	stop: function() {
		this._subscriptionCache.stop();
	},
	ready: function() {
		this._subscriptionCache.onReady();
	},
	reset: function() {
		this.set({});
	}
});