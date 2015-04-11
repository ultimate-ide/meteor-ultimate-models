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