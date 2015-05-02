UltimateForm.extend({
	_deniedAttributeRegex: /^(_originalDoc|_id|errors|collection|_schema|_forms|__type|parent|component|_owner|behaviors|_behaviors|_listeners)$/,
	
	getMongoAttributes: function(includeId, subObject, preparingForSave, isPersisting) {
		var mongoValues = {},
			obj = subObject || this;
		
		for(var prop in obj) {
			if(this.isMongoAttribute(obj, prop, preparingForSave, isPersisting)) {
				
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
	isMongoAttribute: function(obj, prop, preparingForSave, isPersisting) {
		if(this._needsClassName(prop)) return true;
	
		if(this._isBasicDeniedProperty) return false;
		if(this._isLocal(prop)) return false;
		if(this._isVeryPrivateProperty(prop)) return false;		
		if(this._isPreparingToSaveEqualDocs(prop, obj)) return false; //no need to save same values
	
		return true;
	},
	_needsClassName: function(prop, isPersisting) {
		return (!this._id || isPersisting) && prop == 'className';
	},
	_isBasicDeniedProperty: function() {
		return  _.isFunction(obj[prop]) || !obj.hasOwnProperty(prop) || this._deniedAttributeRegex.test(prop);
	},
	_isLocal: function(prop) {
		return Meteor.isServer && (prop == 'local' || prop == '_local_reactive');
	},
	_isVeryPrivateProperty: function(prop) {
		return prop.indexOf('___') === 0;
	},
	_isPreparingToSaveEqualDocs: function(prop, obj) {
		return preparingForSave && obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop]);
	},
	
	
	copyProperties: function(otherObj) {
		otherObj = otherObj.getMongoAttributes ? otherObj.getMongoAttributes() : otherObj;
		delete otherObj.className;
		_.extend(this, otherObj);
	},
	copyPropertiesInto: function(otherObj) {
		var obj = this.getMongoAttributes();
		delete obj.className;
		_.extend(otherObj, obj);
	},
	
	
	setNonSaveable: function(key, val) {
		this['___'+key] = val;
	},
	getNonSaveable: function(key) {
		return this['___'+key];
	},
	extendWithDoc: function(doc) {
		_.extend(this, doc);
	}
});