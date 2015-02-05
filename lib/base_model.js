Model = function Model(doc) {
	if(doc) {
		_.extend(this, doc);
		if(doc._id) this._originalDoc = doc;
	}
};

Model.extends(Base, {
  errors: {},

  db: function() {
    if(this._local) return this.collection._collection;
    else return this.collection;
  },
  persist: function() {
    this.db().remove(this._id);
    delete this._local;
    delete this._id;
    this.save();
  },
  store: function() {
    this._local = true;
    this.save();
  },
  save: function(cb) {
    var attributes = this.getMongoAttributes();
    return this._upsert(attributes, cb);
  },
  _upsert: function(attributes, cb) {
    if(this._id) return this.update(attributes, cb);
    else return this.insert(attributes, cb);
  },
  insert: function(attributes, cb) {
    this._id = this.db().insert(attributes, cb);
    this.refresh();

    return this._id;
  },
  update: function(attributes, cb) {
    this.db().update(this._id, {$set: attributes}, cb);
    this.refresh();

    return this._id;
  },
	updatedEmbedded: function(att, value, cb) {
		var obj = {};
		obj[att] = value;
		return this.update(obj, cb);
	},
  increment: function(attVal) {
    this.db().update(this._id, {$inc: attVal});
    this.refresh();

    return this._id;
  },
  push: function(attVal) {
    this.db().update(this._id, {$push: attVal});
  },
  pop: function(att) {
		var obj = {};
		obj[att] = 1;
    this.db().update(this._id, {$pop: obj});
  },
  shift: function(att) {
		var obj = {};
		obj[att] = -1;
    this.db().update(this._id, {$pop: obj});
  },
  remove: function() {
    this.db().remove(this._id);
  },
  refresh: function(){
		var newObj = this.collection.findOne(this._id);
		this._originalDoc = newObj;
    this.extend(newObj);
  },
  getMongoAttributes: function(includeId, subObject) {
    var mongoValues = {},
			obj = subObject || this;
		
    for(var prop in obj) {
			if(this.isMongoAttribute(obj, prop)) {
				
				if(_.isObject(obj[prop])) {
					if(obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop])) continue;
					else mongoValues[prop] = this.getMongoAttributes(null, obj[prop]);
				}
	      else mongoValues[prop] = obj[prop];
			}
    }

    if(includeId && !subObject) mongoValues._id = this._id;

    return mongoValues;
  },
  isMongoAttribute: function(obj, prop) {
    if(_.isFunction(obj[prop])) return false;
		if(!obj.hasOwnProperty(prop)) return false;
		
		if(prop == '_originalDoc') return false;
		if(obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop])) return false; //no need to save same values
		
    if(prop == '_id' || prop == 'errors' || prop == 'collection' || prop == '__type' ||
			 prop == 'className' || prop.indexOf('___' || prop) === 0 || prop == 'parent') return false;
		
    return true;
  },
  time: function(field) {
    return moment(this[field]).format("MM/DD - h:mma");
  },
  extend: function(doc) {
    doc = doc != undefined && _.isObject(doc) ? doc : {};

    _.extend(this, doc);
  },
  delete: function(noAfterDelete) {
    this.db().remove(this._id);
    if(this.afterDelete && !noAfterDelete) this.afterDelete();
  }
});