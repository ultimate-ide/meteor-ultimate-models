SetupHook = function SetupHook(proto, methods) {
	this.collection = proto.collection;
	this.methods = methods;
};


SetupHook.prototype = {
	validate: function() {
		this.collection.before.insert(function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnInsert);
				
			if(errors.length > 1) throw new Meteor.Error('model invalid', 'failure to insert', errors.join('/n'));
		});
		
		this.collection.before.update(function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnUpdate);
			
			if(errors.length > 1) throw new Meteor.Error('model invalid', 'failure to update', errors.join('/n'));
		});
	},
	
	
	onBeforeInsert: function() {
		var onBeforeInsert = this.methods.onBeforeInsert;

		var newFunc = function(userId, doc) {
			var model = this.transform();		
			onBeforeInsert.apply(model, [userId, this]);
		
			for(var prop in doc) delete doc[prop];	
			_.extend(doc, model.getMongoAttributes(true));
		};

		this.collection.before.insert(newFunc);
	},
	onBeforeUpdate: function() {
		var onBeforeUpdate = this.methods.onBeforeUpdate;

		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			if(doc._local || modifier._local) return; 
		
			var model = this.transform();		
			_.extend(model, modifier.$set);

			onBeforeUpdate.apply(model, [userId, this, fieldNames, modifier, options]);
		
			modifier.$set = model.getMongoAttributes(null, null, true);
		};

		this.collection.before.update(newFunc);
	},
	onBeforeRemove: function() {
		var onBeforeRemove = this.methods.onBeforeRemove;

		var newFunc = function(userId, doc) {
			var model = this.transform();		
			onBeforeRemove.apply(model, [userId, this]);
		};

		this.collection.before.remove(newFunc);
	},
	onAfterInsert: function() {
		var onAfterInsert = this.methods.onAfterInsert;

		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model._id = model._id || this._id;
			onAfterInsert.apply(model, [userId, this]);
		};

		this.collection.after.insert(newFunc);
	},
	onAfterUpdate: function() {
		var onAfterUpdate = this.methods.onAfterUpdate;

		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			var model = this.transform();		
			onAfterUpdate.apply(model, [userId, this, fieldNames, modifier, options]);
		};

		this.collection.after.update(newFunc);
	},
	onAfterRemove: function() {
		var onAfterRemove = this.methods.onAfterRemove;

		var newFunc = function(userId, doc) {
			var model = this.transform();		
			onAfterRemove.apply(model, [userId, this]);
		};

		this.collection.after.remove(newFunc);
	},
	
	
	onAfterFindOne: function() {
		var onAfterFindOne = this.methods.onAfterFindOne;
	
		var newFunc = function(userId, selector, options, doc) {
			var model = this.transform ? this.transform(doc) : doc;		
			onAfterFindOne.apply(model, [userId, selector, options, this]);
		};
	
		this.collection.after.findOne(newFunc);
	},
	
	
	onBeforeFind: function() {
		this.collection.before.find(this.methods.onBeforeFind);
	},
	onAfterFind: function() {
		this.collection.after.find(this.methods.onAfterFind);		
	},
	onBeforeFindOne: function() {
		this.collection.before.findOne(this.methods.onBeforeFindOne);		
	}
};


