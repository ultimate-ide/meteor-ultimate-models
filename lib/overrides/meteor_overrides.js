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
		
Meteor.Collection.prototype.remove = function(selector, callingAgain) {
	//console.log('calling remove');
	//if(typeof UltimateAggregate !== 'undefined') 
	Meteor.call('ultimate_remove', selector, this._name, function() {
		oldRemove.call(this, selector); 
	}.bind(this));
	//need to test and insure Meteor.call runs first, so there are objects on server put in Removal trash
};

if(Meteor.isServer) {
	Meteor.methods({
		ultimate_remove: function(selector, name) {
			var collection = Ultimate.collections[name];

			//console.log('REMOVE CALLED', name, selector);
			var models = collection.find(selector).fetch();

			this.unblock();

			models.forEach(function(obj) {
				console.log('remove each', obj._id);
				obj.collection = collection._name;
				delete obj._id;
				delete obj._originalDoc;
				UltimateRemovals.insert(obj);
			});
		}
	});
};

/** TOO DANGEROUS CUZ PUBLISHERS FROM MULTIPLE USERS SHARE THE SAME Ultimate.currentUserId prop and Ultimate.userId() method
if(Meteor.isServer) {
	var oldPublish = Meteor.publish;

	Meteor.publish = function(name, func) {
		var newFunc = function() {
			Ultimate.currentUserId = this.userId;
			return func.apply(this, arguments);
		};

		return oldPublish.call(Meteor, name, newFunc);
	};
}
**/

