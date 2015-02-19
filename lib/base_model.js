Model = function Model(doc, reactive, keep) {	
	if(doc && doc._id) { //already a reactive cursor from find/findOne()
		_.extend(this, doc);
		this.setOriginalDoc(doc);
	}
	else {
		if(Meteor.isClient && reactive !== false) {
			var line = this.getLine(reactive),
				self = this.findLocal(line);

			if(self) {
				if(Tracker.currentComputation && Tracker.currentComputation.firstRun && !keep) {
					self.removeLocal(); //this will make it so old objects dont come back in the first autorun
					_.extend(this, doc);
					this.store(line); //make reactive cuz it will be found via the findLocal() call above
				}
				else _.extend(this, self); //this is where the magic happens--changes to the object will be preserved throughout reactivity
			}
			else {
				_.extend(this, doc);
				this.store(line); //make reactive cuz it will be found via the findLocal() call above
			}
		}
		else _.extend(this, doc);
	}
};

Model.extends(Base, {
	getLine: function(reactive) {
		var line;
	
		try {
			throw new Error;
		}
		catch(e) {
			var lines = e.stack.split('\n');
			
			line = lines[4] + lines[5] + lines[6] + lines[7] + lines[8] + reactive;
			//identify object via calling code lines (backwards in stack), so we can store it and make it reactive
		}

		return line;
	},
	findLocal: function(id) {
		return this.collection._collection.findOne({_local_id: id});
	},
	removeLocal: function() {
		this.collection._collection.remove(this._id);
	},
	
	setOriginalDoc: function(newObj) {
		if(!this._local) this._originalDoc = newObj;
	},
	
	set: function(prop, val) {
		this[prop] = val;
		this.save();
	},
	
  errors: {},

  db: function() {
    if(this._local && Meteor.isClient) return this.collection._collection;
    else return this.collection;
  },
  persist: function(cb, removeLocal) {
    delete this._local; //all calls to save() will save to the server going forward
    //delete this._id;
		
		if(removeLocal) { //use this when a user is done filling out a form and u now wanna show an empty form
			this.removeLocal();
			delete this._local_id;
		}
		
		var attributes = this.getMongoAttributes(true);
    return this.insert(attributes, cb);
  },
  store: function(id) {
    this._local = true; //makes this.db() use local client side this.collection._collection
		if(id) this._local_id = id;
    return this.save();
  },
  save: function(cb) {
    var attributes = this.getMongoAttributes(null, null, true);
    return this._upsert(attributes, cb);
  },
  _upsert: function(attributes, cb) {
    if(this._id) return this.update(attributes, cb);
    else return this.insert(attributes, cb);
  },
  insert: function(attributes, cb) {
    this._id = this.db().insert(attributes, function() {
    	this.refresh(cb);
    }.bind(this));

    return this._id;
  },
  update: function(attributes, cb) {
    this.db().update(this._id, {$set: attributes}, function() {
    	this.refresh(cb);
    }.bind(this));

    return this._id;
  },
	updateUsingModifier: function($modifier, cb) {
    this.db().update(this._id, $modifier, function() {
    	this.refresh(cb);
    }.bind(this));

    return this._id;
	},
	findSelf: function(noTransform) {
		if(noTransform) return this.db().findOne(this._id, {transform: null});
		else return this.db().findOne(this._id);
	},
  refresh: function(cb){
		var newObj = this.findSelf(true);
		this.setOriginalDoc(newObj);
		
		if(cb) cb.call(this);
  },
	updatedEmbedded: function(att, value, cb) {
		var obj = {};
		obj[att] = value;
		return this.update(obj, cb);
	},
  increment: function(attVal) {
    this.db().update(this._id, {$inc: attVal}, function() {
    	this.refresh();
    }.bind(this));

    return this._id;
  },
  push: function(attVal) {
    this.db().update(this._id, {$push: attVal}, function() {
    	this.refresh();
    }.bind(this));
  },
  pop: function(att) {
		var obj = {};
		obj[att] = 1;
    this.db().update(this._id, {$pop: obj}, function() {
    	this.refresh();
    }.bind(this));
  },
  shift: function(att) {
		var obj = {};
		obj[att] = -1;
    this.db().update(this._id, {$pop: obj}, function() {
    	this.refresh();
    }.bind(this));
  },
  remove: function() {
    this.db().remove(this._id);
  },
  getMongoAttributes: function(includeId, subObject, preparingForSave) {
    var mongoValues = {},
			obj = subObject || this;
		
    for(var prop in obj) {
			if(this.isMongoAttribute(obj, prop, preparingForSave)) {
				
				if(_.isObject(obj[prop])) {
					if(preparingForSave && obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop])) continue; //dont save old att/vals
					else mongoValues[prop] = this.getMongoAttributes(null, obj[prop], preparingForSave);
				}
	      else mongoValues[prop] = obj[prop];
			}
    }

    if(includeId && !subObject) mongoValues._id = this._id;

    return mongoValues;
  },
  isMongoAttribute: function(obj, prop, preparingForSave) {
    if(_.isFunction(obj[prop])) return false;
		if(!obj.hasOwnProperty(prop)) return false;
		
		if(prop == '_originalDoc') return false;
		if(preparingForSave && obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop])) return false; //no need to save same values
		
		if(Meteor.isServer && prop == '_local') return false;
		
    if(prop == '_id' || prop == 'errors' || prop == 'collection' || prop == '__type' ||
			 prop == 'className' || prop.indexOf('___' || prop) === 0 || prop == 'parent' ||
			 prop == '_schema' || prop == '_forms') return false;
		
    return true;
  },
	getMongoAttributesForFields: function(fields) {
		var atts = this.getMongoAttributes(),
			obj = {};
			
		_.each(fields, function(field) {
			obj[field] = atts[field];
		});
		
		return obj;
	},
  time: function(field) {
    return moment(this[field]).format("MM/DD - h:mma");
  },
  delete: function(noAfterDelete) {
    this.db().remove(this._id);
    if(this.afterDelete && !noAfterDelete) this.afterDelete();
  }
});