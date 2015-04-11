Ultimate('UltimateCollectionOverride').extends({
	onBeforeStartup: function() {
		this.overrideCollection();
		this.overrideRemove();
	},
	overrideCollection: function() {
		var oldMeteorCollection = Meteor.Collection;
	
		Meteor.Collection = function(name, options) {
			var newCollection = new oldMeteorCollection(name, options);
			Ultimate.collections[name] = newCollection;
			return newCollection;
		};
	},
	overrideRemove: function() {
		var oldRemove = Meteor.Collection.prototype.remove;
		
		Meteor.Collection.prototype.remove = function(selector) {
			Meteor.call('ultimate_remove', selector, this._name);
			oldRemove.apply(this, arguments);
		};

		Meteor.methods({
			ultimate_remove: function(selector, name) {
				var collection = Ultimate.collections[name];
		
				collection.find(selector).forEach(function(obj) {
					obj.collection = collection._name;
					delete obj._id;
					UltimateRemovals.insert(obj);
				});
			}
		});
	}
});