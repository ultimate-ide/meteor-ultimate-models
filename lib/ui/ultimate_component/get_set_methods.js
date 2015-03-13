UltimateTemplate.extend({
	get: function(k, store) {
		return this.getStore().get(k);
	},
	set: function(k, v, store) {
		return this.getStore(store).set(k, v);
	},
	getStore: function(store) {
		store = store || this.store;
		
		if(!store) return this._reactiveDict();
		
		var store = this.store.toLowerCase();
		
		if(store == 'session') return Session;
		else if(store == 'cache') return SessionStore;
		else if(store == 'reactivedict' || store == 'reactive-dict') return this._reactiveDict();
		else return this._reactiveDict();
	},
	_reactiveDict: function() {
		return this.instance()._reactiveDict = this.instance()._reactiveDict || new ReactiveDict;
	},
	
	
	push: function(k, v, store) {
		var arr = this.get(k, store);
		arr = _.isArray(arr) ? arr : [];		
		arr.push(v);	
		this.set(k, arr, store);
		return arr;
	},
	unshift: function(k, v, store) {
		var arr = this.get(k, store);
		arr = _.isArray(arr) ? arr : [];		
		arr.unshift(v);	
		this.set(k, arr, store);
		return arr;
	},
	pop: function(k, store) {
		var arr = this.get(k, store),
			v = _.isArray(arr) ? arr.pop() : null;
	
		this.set(k, arr);
		return v;
	},
	shift: function(k, store) {
		var arr = this.get(k, store),
			v = _.isArray(arr) ? arr.shift() : null;

		this.set(k, arr, store);
		return v;
	},
	
	
	increment: function(k, amount, store) {
		var v = this.get(k, store) || 0;
		v += amount;

		this.set(k, v, store);
		return v;
	},
	decrement: function(k, amount, store) {
		var v = this.get(k, store) || 0;
		v -= amount;

		this.set(k, v, store);
		return v;
	},
	
	incrementLimit: function(amount) {
		return this.increment('limit', amount, 'reactive-dict');
	},
	decrementLimit: function(amount) {
		return this.decrement('limit', amount, 'reactive-dict');
	},
	getLimit: function() {
		return this.get('limit', 'reactive-dict');
	},
	setLimit: function(amount) {
		return this.get('limit', amount, 'reactive-dict');
	},
});