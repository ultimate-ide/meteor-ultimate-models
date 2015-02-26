if(typeof process != 'undefined')  __meteor_runtime_config__.MODE = process.env.NODE_ENV; //must run at very beginning so sent to client

InheritanceHelper = function InheritanceHelper(Parent, className, constructor) {
	this.Parent = Parent;
	this.className = className;
	this.originalConstructor = constructor;
};
	
InheritanceHelper.extend({
	transformClass: function() {
		var isDescendantOfModel = this._isDescendantOfModel(),
			originalConstructor = this.originalConstructor,
			intializing = false;
	
		initializing = true;
		this.proto = new this.Parent; //Instantiate a base class, but don't run the constructor
	  initializing = false; //because 'initializing' var is in this closure during 'new this.parent' cuz 'this.Parent === Class' below
			
		var Class = function Class() {
			if(initializing) return; //construction performed by originalConstructor after, but only after all this initial setup
			if(arguments[0] == 'no_params') return; //this object will be populdated in extendHTTP code
		
			if(isDescendantOfModel) UltimateModel.construct.apply(this, arguments);
			return originalConstructor.apply(this, arguments); //call the original constructor
	  }
		
		return this._isDevelopment() ? eval(this._prepStringForEval(Class)) : Class; //development uses NAMED FUNCTIONS!
	},
	
	
	attachPrototype: function(Class) {
		this.Class = Class;
		this.Class.prototype = this.proto; //ultimate the fancy prototype setup was done in transformClass, with the 'intializing' var
	},
	configurePrototype: function() {
		var Class = this.Class;
		
	  Class.prototype.constructor = Class; //Enforce constructor to be what we expect
		Class.prototype.class = Class; //but also put it here so we can use more "class-like" terminology
		Class.prototype.parent = this.Parent.prototype; //make it so we can call parent method
		Class.prototype.construct = this.originalConstructor; //set the actual constructor for usage elsewhere
		Class.prototype.className = this.className;
		Class.prototype.__type = 'instance_'+this.className; //for use by UltimateHTTP functionality 
		Class.prototype.___proto = Class.prototype;
	},
	addMethods: function(methods) {
		Function.__extend(this.Class.prototype, methods);
	},
	configureStatics: function() {
		var Class = this.Class;
		
		Class.parent = this.Parent;
		Class.className = this.className;
		Class.__type = 'class_'+this.className; //for use by UltimateHTTP functionality
		Class.construct = this.originalConstructor;
	
		Class.mixinStatic(this.Parent);
	},
	
	
	_isDevelopment: function() {
		return this._mode() === 'development';
	},
	_mode: function() {
		return this.__mode = this.__mode || __meteor_runtime_config__.MODE;
	},
	
	_prepStringForEval: function(Class) {
		return '(' + Class.toString().replace(/Class/g, this.className) + ')';
	},
	_isDescendantOfModel: function() {
		return this.Parent.className == 'UltimateModel' || this.Parent.__type.indexOf('model_') === 0;
	}
});