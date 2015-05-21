Meteor.Collection.Cursor.prototype.fetchIds = function() {
	return this.map(function(model) {
		return model._id;
	});
};

Meteor.Collection.Cursor.prototype.fetchValues = function(key) {
	return this.map(function(model) {
		return model[key];
	});
};



var oldRemove = Meteor.Collection.prototype.remove;
		
Meteor.Collection.prototype.remove = function(selector) {
	if(typeof UltimateAggregate !== 'undefined') Meteor.call('ultimate_remove', selector, this._name);
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


if(Meteor.isServer) {
	var oldPublish = Meteor.publish;

	Meteor.publish = function(name, func) {
		var newFunc = function() {
			Ultimate.currentUserId = this.userId;
			func.apply(this, arguments);
			Ultimate.currentUserId = null;
		};

		return oldPublish.call(Meteor, name, newFunc);
	};
}

