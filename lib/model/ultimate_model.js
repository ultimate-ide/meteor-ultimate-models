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
		if(!this._local || Meteor.isServer) this._originalDoc = newObj;
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
		if(this._local_reactive && !Meteor.isServer) return this.reactiveStore(this._local_reactive, true);
		
    var attributes = this.getMongoAttributes(null, null, true);
		console.log("HELP", attributes);
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
	
	
	set: function(prop, val) { //used primarily to evoke reactivity for single property setting
		this[prop] = val;
		this.save();
	},
	get: function(prop) {
		return this[prop];
	}
});