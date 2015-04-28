_.extendMultiple([UltimateClass, UltimateClass.prototype], {
	//_listeners: {}, //on objects
	//_behaviors: {}, //on objects
	
	//behaviors: [], //on objects; set on child class prototypes, eg: [BehaviorClass, [BehaviorClass, 'prop', 'methodName']]
	
	
	attachBehaviors: function() {
		if(!_.isArray(this.behaviors)) return;
		if(_.isString(this.behaviors[1])) this.behaviors = [this.behaviors]; //single behaviors: [BehaviorClass, 'prop']	
		
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
		this.getBehaviors()[prop] = obj;
		if(methodName && obj.is('behavior')) obj.assignProxyMethod(methodName, prop, environment);
		
		if(this.isChildOf('UltimateModel')) {
			var setupModel = new SetupModel(this, obj); //model hooks have a custom way to deal with behavior events
			setupModel.hooks();
		}
	},
	
	returnBehavior: function(prop, environment) {
		var behavior = this.getBehaviors()[prop];
		return behavior.is('behavior') ? behavior.returnBehavior(prop, environment) : behavior;
	},
	
	
	getBehavior: function(prop) {
		return this.getBehaviors()[prop].behavior;
	},
	getBehaviors: function() {
		return this._behaviors = this._behaviors || {};
	},
	removeBehavior: function(prop, methodName) {
		this._behaviors[prop].removeSelfAsBehavior();
		delete this._behaviors[prop];
		delete this[methodName];
	},
	removeSelfAsBehavior: function() {
		delete this._owner;
	},
	
	
	emit: function(eventName) {
		var args = _.toArray(arguments);

		var callNext = _.applyNext(this.listeners(eventName), this, args.slice(1)); //remove eventName
		if(callNext !== false) callNext = _.invokeNextApply(this.getBehaviors(), 'emit', null, args); //leave eventName
		
		return callNext; //emit bubbling will stop if any event handler or behavior.emit() call returns false
	},
	on: function(eventName, func, runImmediately, args) {
		if(!_.isFunction(func)) return; //may get called like in setup_model.js without actual functions
		
		if(runImmediately) func.apply(this, args);
		this._addedListeners(eventName).push(func);
	},
	off: function(eventName, func) {
		var listeners = this._addedListeners(eventName);
		
		this._listenersObject()[eventName] = _.reject(listeners, function(listener) {
			return listener.toString() == func.toString();
		});
	},
	
	
	listeners: function(eventName) {
		var listeners = this._addedListeners(eventName),
			method = this._onMethod(eventName); //get onSomeMethod attached to class
			
		return method ? [method].concat(listeners) : listeners; //prepend onSomeMethod if existent
	},
	
	
	_addedListeners: function(eventName) {
		return this._listenersObject()[eventName] = this._listenersObject()[eventName] || [];
	},
	_listenersObject: function() {
		return this._listeners = this._listeners || {};
	},
	_onMethod: function(eventName) {
		var methodName = this._onEventName(eventName);
		return this[methodName];
	},
	_onEventName: function(eventName) {
		return 'on'+eventName.capitalizeOnlyFirstLetter();
	}
});

_.extend(UltimateClass, {
  attachBehavior: function(Class, prop, methodName, environment) {
    if(_.isString(Class)) {
      if(Ultimate.classes[Class]) Class = Ultimate.classes[Class];
      else Class = Ultimate(Class).extends(UltimateBehavior, {});
    }

    if(Class.is('behavior')) Class.constructBehavior(this)
    else Class._owner = this; //do this for objects that aren't true UltimateBehavior classes

    var prop = prop || obj.className;
    this.getBehaviors()[obj.className] = Class;
    if(methodName && Class.is('behavior')) Class.assignProxyMethod(methodName, prop, environment);
  },


  emitBeforeStartup: function() {
    if(this.isAbstract()) return;
    this.getPrototype().emit('beforeStartup');
    this.emit('beforeStartup');
  },
  emitStartup: function() {
    if(this.isAbstract()) return;

    Meteor.startup(function() {
      this.getPrototype().emit('startup');
      this.emit('startup');
    }.bind(this));
  }
});