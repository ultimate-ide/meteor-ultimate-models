UltimateClass.extend({
	//_listeners: {}, //on objects
	//_behaviors: {}, //on objects
	
	//behaviors: [], //on objects; set by client code, eg: [BehaviorClass, [BehaviorClass, 'prop', 'methodName']]
	
	
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
		else if(Class instanceOf UltimateClass) obj = Class; //already instantiated;
		else obj = new Class(this[prop]); //dont pass in owner unless is true UltimateBehavior class
			
		var prop = prop || obj.className;	
		obj._owner = this; //do this for objects that aren't instantiated from true UltimateBehavior classes
			
		this.getBehaviors()[prop] = obj;
		if(methodName && obj.is('behvioar')) obj.assignProxyMethod(methodName, prop, enviornment);
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
		
		this.listeners(eventName).forEach(function(func) {
			func.apply(this, args);
		}, this);
		
		this.getBehaviors().forEach(function(behavior) {
			behavior.emit(eventName);
		});
	},
	on: function(eventName, func, runImmediately, args) {
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
});