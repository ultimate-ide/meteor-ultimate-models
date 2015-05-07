UltimateClass.extendBoth({
	//_behaviors: {},
	//behaviors: [], //set on child class prototypes, eg: [BehaviorClass, [BehaviorClass, 'prop', 'methodName']]

	attachBehaviors: function() {
		if(!_.isArray(this.behaviors)) return;
		if(_.isString(this.behaviors[1])) this.getPrototype().behaviors = [this.behaviors]; //single behaviors: [BehaviorClass, 'prop']	
		
		_.each(this.behaviors, function(behavior) {
			var parts = [].concat(behavior);
			this.attachBehavior.apply(this, parts);
		}, this);
	},
	attachBehavior: function(Class, prop, methodName, environment) {
		if(_.isString(Class)) {
			if(Ultimate.classes[Class]) Class = Ultimate.classes[Class];
			else Class = Ultimate(Class).extends(UltimateBehavior, {});
		}

		var obj;
		
		if(Class.is('behavior')) obj = new Class(this[prop], this); //passin this as owner
		else if(Class instanceof UltimateClass) obj = Class; //already instantiated;
		else obj = new Class(this[prop]); //dont pass in owner unless is true UltimateBehavior class
			
		obj._owner = this; //do this for objects that aren't instantiated from true UltimateBehavior classes
			
		var prop = prop || obj.className;	
		this.lazyBehaviors()[prop] = obj;
		if(methodName && obj.is('behavior')) obj.assignProxyMethod(methodName, prop, environment);
		
		if(this.isChildOf('UltimateModel')) {
			Ultimate.setupHooks(obj, this.getPrototype()); 
			//Model hooks have a custom way to deal with behavior events.
			//Also note that unfortunately hook handlers will be added for all objects of collection, not just this one
			//which would be the correct way to handle behaviors, since they are dynamically attached as instantiated 
			//objects to another instantiated object
		}
	},
	
	returnBehavior: function(prop, environment) {
		var behavior = this.lazyBehaviors()[prop];
		return behavior.is('behavior') ? behavior.returnBehavior(prop, environment) : behavior;
	},
	

  getBehaviors: function() {
    if(!this._behaviors) return null;
    else return this.lazyBehaviors();
  },
	lazyBehaviors: function() {
		return this._behaviors = this._behaviors || {};
	},
  getBehavior: function(prop) {
    if(!this.getBehaviors()) return null;
    else return this.lazyBehaviors()[prop];
  },
	removeBehavior: function(prop, methodName) {
		this._behaviors[prop].removeSelfAsBehavior();
		delete this._behaviors[prop];
		if(methodName) delete this[methodName];
	},
	removeSelfAsBehavior: function() {
		delete this._owner;
	}
});

UltimateClass.extendStatic({
  attachBehavior: function(Class, prop, methodName, environment) {
    if(_.isString(Class)) {
      if(Ultimate.classes[Class]) Class = Ultimate.classes[Class];
      else Class = Ultimate(Class).extends(UltimateBehavior, {}); //non-existent client Classes are automatically created
    }

    if(Class.is('behavior')) Class.constructBehavior(this);
    else Class._owner = this; //do this for objects that aren't true UltimateBehavior classes

    var prop = prop || obj.className;
    this.lazyBehaviors()[obj.className] = Class;
    if(methodName && Class.is('behavior')) Class.assignProxyMethod(methodName, prop, environment);
  }
});