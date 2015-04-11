SetupHook = function SetupHook(proto, methods) {
	this.proto = proto;
	this.collection = proto.collection;
	this.methods = methods;
};


SetupHook.prototype = {
	validate: function() {
		var newFunc = function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnInsert);
								
			if(errors.length > 1) throw new Meteor.Error('model invalid', 'failure to insert', errors.join('/n'));		
		};
		
		this.collection.before.insert(newFunc);
		
		
		newFunc = function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnUpdate);	
					
			if(errors.length > 1) throw new Meteor.Error('model invalid', 'failure to update', errors.join('/n'));		
		};
		
		this.collection.before.update(newFunc);
	},
	
	
	onBeforeInsert: function() {
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['onBeforeInsert', userId, this]);
			
			for(var prop in doc) delete doc[prop];	
			_.extend(doc, model.getMongoAttributes(true));
			doc.created_at = doc.updated_at = new Date;
		};

		this.collection.before.insert(newFunc);
	},
	onBeforeUpdate: function() {
		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			if(doc._local || modifier._local) return; 
		
			var model = this.transform();		
			_.extend(model, modifier.$set);

			model.emit.apply(model, ['onBeforeUpdate', userId, this, fieldNames, modifier, options]);
			
			modifier.$set = model.getMongoAttributes(null, null, true);
			modifier.$set.updated_at = new Date;
		};

		this.collection.before.update(newFunc);
	},
	onBeforeRemove: function() {
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['onBeforeRemove', userId, this]);
		};

		this.collection.before.remove(newFunc);
	},
	onAfterInsert: function() {
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model._id = model._id || this._id;
			model.emit.apply(model, ['onAfterInsert', userId, this]);
		};

		this.collection.after.insert(newFunc);
	},
	onAfterUpdate: function() {
		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			var model = this.transform();		
			model.emit.apply(model, ['onAfterUpdate', userId, this, fieldNames, modifier, options]);
		};

		this.collection.after.update(newFunc);
	},
	onAfterRemove: function() {
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['onAfterRemove', userId, this]);
		};

		this.collection.after.remove(newFunc);
	},
	
	
	onAfterFindOne: function() {
		var newFunc = function(userId, selector, options, doc) {
			var model = this.tansform ? this.transform(doc) : new Ultimate.classes[doc.className](doc);
			model.emit.apply(model, ['onAfterFindOne', userId, selector, options, this]);
		};
	
		this.collection.after.findOne(newFunc);
	},
	
	
	onBeforeFind: function() {
		var newFunc = function(userId, selector, options) {
			this.proto.emit.apply(this.proto, ['onBeforeFind', userId, selector, options, this]);
		};
		
		this.collection.before.find(newFunc);
	},
	onAfterFind: function() {
		var newFunc = function(userId, selector, options, cursor) {
			this.proto.emit.apply(this.proto, ['onAfterFind', userId, selector, options, cursor, this]);
		};
		
		this.collection.after.find(newFunc);		
	},
	onBeforeFindOne: function() {
		var newFunc = function(userId, selector, options) {
			this.proto.emit.apply(this.proto, ['onBeforeFindOne', userId, selector, options, this]);
		};
		
		this.collection.before.findOne(newFunc);		
	}
};


