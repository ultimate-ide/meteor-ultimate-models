UltimateForm.extend({
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
		if(prop == 'className') return true;
    if(_.isFunction(obj[prop])) return false;
		if(!obj.hasOwnProperty(prop)) return false;
		
		if(prop == '_originalDoc') return false;
		if(preparingForSave && obj._originalDoc && _.isEqual(obj._originalDoc[prop], obj[prop])) return false; //no need to save same values
		
		if(Meteor.isServer && prop == '_local') return false;
		if(Meteor.isServer && prop == '_local_reactive') return false;
		
    if(prop == '_id' || prop == 'errors' || prop == 'collection' || prop == '__type' ||
			 prop.indexOf('___') === 0 || prop == 'parent' ||
			 prop == '_schema' || prop == '_forms') return false;
		
    return true;
  }
});