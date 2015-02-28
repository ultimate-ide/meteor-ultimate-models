UltimateTemplate.extend({
	get: function(k) {
		this._reactiveDict().get(k);
	},
	set: function(k, v) {
		this._reactiveDict().set(k, v);
	},
	_reactiveDict: function() {
		return this.instance()._reactiveDict = this.instance()._reactiveDict || new ReactiveDict;
	},
	
	
	push: function(k, v) {
		var arr = this.get(k);
		arr = _.isArray(arr) ? arr : [];		
		arr.push(v);	
		this.set(k, arr);
	},
	unshift: function(k, v) {
		var arr = this.get(k);
		arr = _.isArray(arr) ? arr : [];		
		arr.unshift(v);	
		this.set(k, arr);
	},
	pop: function(k) {
		var arr = this.get(k),
			v = _.isArray(arr) ? arr.pop() : null;
	
		this.set(k, arr);
		return v;
	},
	shift: function(k) {
		var arr = this.get(k),
			v = _.isArray(arr) ? arr.shift() : null;

		this.set(k, arr);
		return v;
	},
	
	
	increment: function(k, amount) {
		var v = this.get(k) || 0;
		v += amount;

		this.set(k, v);
		return v;
	},
	decrement: function(k, amount) {
		var v = this.get(k) || 0;
		v -= amount;

		this.set(k, v);
		return v;
	}
});