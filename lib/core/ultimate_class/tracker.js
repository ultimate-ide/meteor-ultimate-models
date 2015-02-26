UltimateClass.extend({
	get: function(prop) {
		this.depend();
		return this[prop];
	},
	set: function(prop, val) {
		this[prop] = val;
		this.changed();
	},
	depend: function() {
		this.dep().depend();
	},
	changed: function() {
		this.dep().changed();
	},
	dep: function() {
		return this.___dep = this.___dep || new Tracker.Dependency;
	}
});