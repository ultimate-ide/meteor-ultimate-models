UltimateClone = function UltimateClone() {};

_.extend(UltimateClone, {
	clone: function(object, testFunc) {
		if(_.isArray(object)) return object.slice(0); 
		
	    var temp = {};
		
		for(var k in object) { //for must be used instead of _.each in order to extract props from function objects
			if(!testFunc || testFunc(object[k], k, object)) temp[k] = object[k];
		}
			
	    return temp;
	},
	cloneOwn: function(object, testFunc) {
		if(_.isArray(object)) return object.slice(0); 
		
	    var temp = {};

		for(var k in object) {
			if(object.hasOwnProperty(k) && (!testFunc || testFunc(object[k], k, object))) temp[k] = object[k];
		}
			
	    return temp;
	},
	
	
	
	deepClone: function(object, testFunc, levels, dontDeepCloneObjects) {
	    var clone = this.clone(object, testFunc);

	    _.each(clone, function(value, key) {
	      if(levels && !_.contains(dontDeepCloneObjects, key) 
					&& _.isObject(value) && !_.isFunction(value)) clone[key] = this.deepClone(value, testFunc, levels - 1);
	    }, this);

	    return clone;
	  },
	deepCloneOwn: function(object, testFunc, levels, dontDeepCloneObjects) {
	    var clone = this.cloneOwn(object, testFunc);
			
	    _.each(clone, function(value, key) {
	      if(levels && !_.contains(dontDeepCloneObjects, key) && _.isObject(value) && 
					!_.isFunction(value)) clone[key] = this.deepCloneOwn(value, testFunc, levels - 1);
	    }, this);

	    return clone;
	},
	
	
	extend: function(newObj, oldObj, testFunc) {
		return _.extend(newObj, this.clone(oldObj, testFunc));
	},
	extendOwn: function(newObj, oldObj, testFunc) {
		return _.extend(newObj, this.cloneOwn(oldObj, testFunc));
	},
	
	deepExtend: function(newObj, oldObj, testFunc, levels, dontDeepCloneObjects) {
		return _.extend(newObj, this.deepClone(oldObj, testFunc, levels));
	},
	deepExtendOwn: function(newObj, oldObj, testFunc, levels, dontDeepCloneObjects) {
		return _.extend(newObj, this.deepCloneOwn(oldObj, testFunc, levels));
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
	
	
	extendUltimate: function(Child, Parent) {
		return this.extendOwn(Child, Parent, function(v, prop) {
			return !Ultimate.usesReservedWord(prop);
		});
	},
	deepExtendUltimate: function(Child, Parent) {
		return this.deepExtendOwn(Child, Parent, function(v, prop) {
			return !Ultimate.usesReservedWord(prop);
		}, 1, ['collection', '_schema']);
	}
});