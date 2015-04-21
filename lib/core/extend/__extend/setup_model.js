SetupModel = function SetupModel(proto, methods) {
	this.proto = proto;
	this.collection = proto.collection;
	this.methods = methods;
};


SetupModel.prototype = {
	hooks: function() {
		if(this.methods.onBeforeInsert) this.onBeforeInsert();
		if(this.methods.onBeforeUpdate) this.onBeforeUpdate();
		if(this.methods.onBeforeRemove) this.onBeforeRemove();
		if(this.methods.onAfterInsert) this.onAfterInsert();
		if(this.methods.onAfterUpdate) this.onAfterUpdate();
		if(this.methods.onAfterRemove) this.onAfterRemove();
		if(this.methods.onAfterFindOne) this.onAfterFindOne();
		if(this.methods.onBeforeFind) this.onBeforeFind();
		if(this.methods.onAfterFind) this.onAfterFind();
		if(this.methods.onBeforeFindOne) this.onBeforeFindOne();
	
		if(this.methods.validateOnInsert) this.validateInsert();
		if(this.methods.validateOnUpdate) this.validateUpdate();
	},
	
	
	_addEventHandler: function(name) {
		//eg: this.proto.on('beforeInsert', this.methods.onBeforeInsert)
		var onName = 'on'+name.capitalizeOnlyFirstLetter();
		this.proto.on(name, this.methods[onName]); //the value of methods[onName] could be  simply `true` so that the event is emitted for later-attached handlers
		
		delete this.proto[onName]; 
		
		return this._shouldNotAddHook(name);
	},
	_shouldNotAddHook: function(name) {
		this.proto.addedHooks = this.proto.addedHooks || {};
		var shouldNotAddHook = this.proto.addedHooks[name]; //only add the hook once, the first time
		this.proto.addedHooks[name] = true;
		return shouldNotAddHooks;
	},
	
	
	onBeforeInsert: function() {
		if(this._addEventHandler('beforeInsert')) return;
		
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['beforeInsert', userId, this]);
			
			for(var prop in doc) delete doc[prop];	
			_.extend(doc, model.getMongoAttributes(true));
			doc.created_at = doc.updated_at = new Date;
		};

		this.collection.before.insert(newFunc);
	},
	onBeforeUpdate: function() {
		if(this._addEventHandler('beforeUpdate')) return;
		
		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			if(doc._local || modifier._local) return; 
		
			var model = this.transform();		
			_.extend(model, modifier.$set);

			model.emit.apply(model, ['beforeUpdate', userId, this, fieldNames, modifier, options]);
			
			modifier.$set = model.getMongoAttributes(null, null, true);
			modifier.$set.updated_at = new Date;
		};

		this.collection.before.update(newFunc);
	},
	onBeforeRemove: function() {
		if(this._addEventHandler('beforeRemove')) return;
		
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['beforeRemove', userId, this]);
		};

		this.collection.before.remove(newFunc);
	},
	onAfterInsert: function() {
		if(this._addEventHandler('afterInsert')) return;
		
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model._id = model._id || this._id;
			model.emit.apply(model, ['afterInsert', userId, this]);
		};

		this.collection.after.insert(newFunc);
	},
	onAfterUpdate: function() {
		if(this._addEventHandler('afterUpdate')) return;
		
		var newFunc = function(userId, doc, fieldNames, modifier, options) {
			var model = this.transform();		
			model.emit.apply(model, ['afterUpdate', userId, this, fieldNames, modifier, options]);
		};

		this.collection.after.update(newFunc);
	},
	onAfterRemove: function() {
		if(this._addEventHandler('afterRemove')) return;
		
		var newFunc = function(userId, doc) {
			var model = this.transform();		
			model.emit.apply(model, ['afterRemove', userId, this]);
		};

		this.collection.after.remove(newFunc);
	},
	
	
	onAfterFindOne: function() {
		if(this._addEventHandler('affterFindOne')) return;
		
		var newFunc = function(userId, selector, options, doc) {
			var model = this.tansform ? this.transform(doc) : new Ultimate.classes[doc.className](doc);
			model.emit.apply(model, ['affterFindOne', userId, selector, options, this]);
		};
	
		this.collection.after.findOne(newFunc);
	},
	
	
	onBeforeFind: function() {
		if(this._addEventHandler('beforeFind')) return;
		
		var model = this.proto;
		
		var newFunc = function(userId, selector, options) {
			model.emit.apply(model, ['beforeFind', userId, selector, options, this]);
		};
		
		this.collection.before.find(newFunc);
	},
	onAfterFind: function() {
		if(this._addEventHandler('afterFind')) return;
		
		var model = this.proto;
		
		var newFunc = function(userId, selector, options, cursor) {
			model.emit.apply(model, ['afterFind', userId, selector, options, cursor, this]);
		};
		
		this.collection.after.find(newFunc);		
	},
	onBeforeFindOne: function() {
		if(this._addEventHandler('beforeFindOne')) return;
		
		var model = this.proto;
		
		var newFunc = function(userId, selector, options) {
			model.emit.apply(model, ['beforeFindOne', userId, selector, options, this]);
		};
		
		this.collection.before.findOne(newFunc);		
	},
	
	
	validateInsert: function() {
		if(this._shouldNotAddHook('validateOnInsert')) return;
		
		var newFunc = function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnInsert); //array of forms to validate
			
			if(errors.length > 1) throw new Meteor.Error('invalid-insert', errors.join('\n'));		
		};
		
		this.collection.before.insert(newFunc);
	},
	validateUpdate: function() {
		if(this._shouldNotAddHook('validateOnUpdate')) return;
		
		var newFunc = function() {
			var model = this.transform(),
				errors = model.isValidMultipleForms(model.validateOnUpdate); //array of forms to validate
		
			if(errors.length > 1) throw new Meteor.Error('invalid-update', errors.join('\n'));	
		};
		
		this.collection.before.update(newFunc);
	}
};


