var behaviorMethods = {
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
		var obj;
		
		if(Class.is('behavior')) obj = new Class(this[prop], this); //passin this as owner
		else if(Class instanceof UltimateClass) obj = Class; //already instantiated;
		else obj = new Class(this[prop]); //dont pass in owner unless is true UltimateBehavior class
			
		obj._owner = this; //do this for objects that aren't instantiated from true UltimateBehavior classes
			
		var prop = prop || obj.className;	
		this.getBehaviors()[prop] = obj;
		if(methodName && obj.is('behavior')) obj.assignProxyMethod(methodName, prop, enviornment);
		
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
		var args = _.toArray(arguments),
			eventName = args.shift();
		
		_.each(this.listeners(eventName), function(func) {
			func.apply(this, args);
		}, this);
		
		_.each(this.getBehaviors(), function(behavior) {
			behavior.emit.apply(behavior, arguments);
		});
	},
	on: function(eventName, func, runImmediately, args) {
		if(!_.isFunction(func)) return; //may get called like in setup_model.js without actual functions
		
		if(runImmediately) func.apply(this, args);
		this._addedListeners(eventName).push(func);
	},
	off: function(eventName, func) {
		var listeners = this._addedListeners(eventName);
		
		this._listeners[eventName] = _.reject(listeners, function(listener) {
			return listener.toString() == func.toString();
		});
	},
	
	
	listeners: function(eventName) {
		var listeners = this._addedListeners(eventName),
			methodName = this._onEventName(eventName);
			
		if(this[methodName]) listeners.push(this[methodName]);
		return listeners;
	},
	
	
	_addedListeners: function(eventName) {
		return this._listenersObject()[eventName] = this._listenersObject()[eventName] || [];
	},
	_listenersObject: function() {
		return this._listeners = this._listeners || {};
	},
	_onEventName: function(eventName) {
		return 'on'+eventName.capitalizeOnlyFirstLetter();
	}
};

UltimateClass.extend(behaviorMethods);

behaviorMethods.attachBehavior = function(Class, prop, methodName, environment) {	
	if(Class.is('behavior')) Class.constructBehavior(this)
	else Class._owner = this; //do this for objects that aren't true UltimateBehavior classes
	
	var prop = prop || obj.className;	
	this.getBehaviors()[obj.className] = Class;
	if(methodName && Class.is('behavior')) Class.assignProxyMethod(methodName, prop, enviornment);
};

UltimateClass.extendStatic(behaviorMethods);