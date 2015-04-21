UltimateClone = function UltimateClone() {};

_.extend(UltimateClone, {
	clone: function(object, testFunc) {
		if(_.isArray(object)) return object.slice(0); 
		
    var temp = {},
			testFunc = testFunc || function() { return true;};
		
		
		for(var k in object) { //for must be used instead of _.each in order to extract props from function objects
			if(testFunc(object[k], k, object)) temp[k] = object[k];
		}
		
    return temp;
	},
	cloneOwn: function(object, testFunc) {
		if(_.isArray(object)) return object.slice(0); 
		
    var temp = {},
			testFunc = testFunc || function() { return true;};

		for(var k in object) {
			if(object.hasOwnProperty(k) && testFunc(object[k], k, object)) temp[k] = object[k];
		}
		
    return temp;
	},
	
	
	
	deepClone: function(object, testFunc) {
    var clone = this.clone(object, testFunc);

    _.each(clone, function(value, key) {
      if(_.isObject(value) && !_.isFunction(value)) clone[key] = this.deepClone(value, testFunc);
    }, this);

    return clone;
  },
	deepCloneOwn: function(object, testFunc) {
    var clone = this.cloneOwn(object, testFunc);

    _.each(clone, function(value, key) {
      if(_.isObject(value) && !_.isFunction(value)) clone[key] = this.deepCloneOwn(value, testFunc);
    }, this);

    return clone;
  },
	
	
	deepExtend: function(newObj, oldObj, testFunc) {
		return _.extend(newObj, this.deepClone(oldObj, testFunc));
	},
	deepExtendOwn: function(newObj, oldObj, testFunc) {
		return _.extend(newObj, this.deepCloneOwn(oldObj, testFunc));
	},
	
	
	cloneFunc: function(func, testFunc) {
    var temp = function() { return func.apply(this, arguments); },
			obj = this.cloneOwn(func, testFunc);

		return _.extend(temp, obj);
	},
	deepCloneFunc: function(func, testFunc) {
	  var temp = function() { return func.apply(this, arguments); },
			obj = this.deepCloneOwn(func, testFunc);

		return _.extend(temp, obj);
	},
	
	
	deepExtendUltimate: function(Child, Parent) {
		return this.deepExtendOwn(Child, Parent, function(v, prop) {
			return !InheritanceHelper.usesReservedWord(prop);
		});
	}
});