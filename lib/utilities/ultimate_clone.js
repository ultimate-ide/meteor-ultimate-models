UltimateClone = function UltimateClone() {};

UltimateClone.extendStatic({
	clone: function(object, testFunc) {
    var temp = {},
			testFunc = testFunc || function() { return true;};

		_.each(object, function(value, key) {
			if(testFunc(key)) temp[key] = object[key];
		});
		
    return temp;
	},
	cloneOwn: function(object, testFunc) {
    var temp = {},
			testFunc = testFunc || function() { return true;};

		_.each(object, function(value, key) {
			if(object.hasOwnProperty(key) && testFunc(key)) temp[key] = object[key];
		});
		
    return temp;
	},
	
	
	
	deepClone: function(object, testFunc) {
    var clone = this.clone(object, testFunc);

    _.each(clone, function(value, key) {
      if(_.isObject(value)) clone[key] = this.deepClone(value, testFunc);
    }.bind(this));

    return clone;
  },
	deepCloneOwn: function(object, testFunc) {
    var clone = this.cloneOwn(object, testFunc);

    _.each(clone, function(value, key) {
      if(_.isObject(value)) clone[key] = this.deepCloneOwn(value, testFunc);
    }.bind(this));

    return clone;
  },
	
	
	deepExtend: function(newObj, oldObj, testFunc) {
		return _.extend(newObj, this.deepClone(oldObj, testFunc));
	},
	deepExtendOwn: function(newObj, oldObj) {
		return _.extend(newObj, this.deepCloneOwn(oldObj, testFunc));
	},
	
	deepExtendPrototype: function(newObj, oldObj, testFunc) {
		return this.deepExtend(newObj.prototype, oldObj.prototype, testFunc);
	},
	deepExtendPrototypeOwn: function(newObj, oldObj, testFunc) {
		return this.deepExtendOwn(newObj.prototype, oldObj.prototype, testFunc);
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
	}
});