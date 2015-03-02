UltimateModel = Ultimate('UltimateModel').extends(UltimateForm, {
	isModel: true,
	construct: function(doc) {	
		this.extendWithDoc(doc);
		if(doc && doc._id) this.setOriginalDoc(doc);
	},

	
  db: function() {
    if(this._local && Meteor.isClient) return this.collection._collection;
    else return this.collection;
  },

	setOriginalDoc: function(newObj) {
		if(!this._local) this._originalDoc = newObj;
	},
	extendWithDoc: function(doc) {
		_.extend(this, this.defaultValues, doc);
	},

	
  store: function() {
    this._local = true; //makes this.db() use local client side this.collection._collection
		return this.save();
  },
  persist: function(cb) {	
		delete this._local_reactive; //all calls to save() won't store properties in session var going forward
		delete this._local; //all calls to save() will save to the server going forward
		
		var attributes = this.getMongoAttributes(true, null, true);
    return this.insert(attributes, cb);
  },
  save: function(cb) {
		if(this._local_reactive) return this.reactiveStore(this._local_reactive, true);
		
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
  remove: function() {
    this.db().remove(this._id);
  },
  refresh: function(cb){
		var doc = this.getMongoAttributes();
		this.setOriginalDoc(doc);
		
		if(cb) cb.call(this);
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
		if(Meteor.isServer && prop == '_local_id') return false;
		
    if(prop == '_id' || prop == 'errors' || prop == 'collection' || prop == '__type' ||
			 prop == 'className' || prop.indexOf('___') === 0 || prop == 'parent' ||
			 prop == '_schema' || prop == '_forms') return false;
		
    return true;
  }
});