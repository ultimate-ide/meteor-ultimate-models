Ultimate('UltimateClientPublisherDuck').extends({
	construct: function(subscriptionCache) {
		this._subscriptionCache = subscriptionCache;
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
				obj._id = id;
				collection.insert(obj);
			});
		});
		
		this.ready();
	},
	
	
	added: function(collection, id, fields) {
		var cache = this.get();
		
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