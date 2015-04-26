InheritanceHelper = function InheritanceHelper(Parent, className, constructor) {
	this.Parent = Parent;
	this.className = className;
	this.originalConstructor = constructor;
};
	
InheritanceHelper.extend({
	transformClass: function() {
		var isChildOfForm = this._isChildOf('UltimateForm'),
			isChildOfModel = this._isChildOf('UltimateModel'),
			originalConstructor = this.originalConstructor,
			intializing = false;
	
		initializing = true;
		this.proto = new this.Parent; //Instantiate a base class, but don't run the constructor
	  initializing = false; //because 'initializing' var is in this closure during 'new this.parent' cuz 'this.Parent === Class' below
			
		var Class = function Class() {
			if(initializing) return; //construction performed by originalConstructor after, but only after all this initial setup

			this.attachBehaviors();
			var args = _.toArray(arguments);
			this.emit.apply(this, ['beforeConstruct'].concat(args));
			
			if(this.defaults) _.extend(this, this.defaults);
			
			if(arguments[0] == 'no_params') return; //this object will be populdated in extendHTTP code
		
		
			if(isChildOfForm) UltimateForm.construct.apply(this, arguments);
			else if(isChildOfModel) UltimateModel.construct.apply(this, arguments);
			
			var result;
			
			if(originalConstructor) result = originalConstructor.apply(this, arguments); //call the original constructor
			else if(!isChildOfForm && !isChildOfModel) result = this.construct.apply(this, arguments); 
			
			this.emit.apply(this, ['afterConstruct'].concat(args));
			
			return result;
	  };
		
		return this._isDevelopment() ? eval(this._prepStringForEval(Class)) : Class; //development uses NAMED FUNCTIONS!
	},
	
	
	attachPrototype: function(Class) {
		this.Class = Class;
		this.Class.prototype = this.proto; //ultimate the fancy prototype setup was done in transformClass, with the 'intializing' var
	
		Ultimate.classes[this.className] = Class;
	},
	configurePrototype: function() {
		var Class = this.Class;
		
	  Class.prototype.constructor = Class; //Enforce constructor to be what we expect
		Class.prototype.class = Class; //but also put it here so we can use more "class-like" terminology
		Class.prototype.parent = this.Parent.prototype; //make it so we can call parent method
		Class.prototype.className = this.className;
		Class.prototype.__type = this.typePrefix()+'instance_'+this.className; //for use by UltimateHTTP functionality 
		Class.prototype.___proto = Class.prototype;
		Class.prototype.createNew = this._createNewFunc(Class);
	},
	configureStatics: function() {
		var Class = this.Class;
		
		Class.parent = this.Parent;
		Class.className = this.className;
		Class.__type = this.typePrefix()+'class_'+this.className; //for use by UltimateHTTP functionality
		Class.construct = this.originalConstructor;
		Class.createNew = this._createNewFunc(Class);
		Class.class = Class;
		
		Class.mixinStatic(this.Parent);
		Class.attachBehaviors();
	},
	addMethods: function(methods) {
		Function.__extend(this.Class.prototype, methods);
	},
	
	
	_isDevelopment: function() {
		return Ultimate.mode === 'development';
	},
	_isChildOf: function(className) {
		return this.Parent.className == className || this.Parent.isChildOf(className);
	},
	_prepStringForEval: function(Class) {
		return '(' + Class.toString().replace(/Class/g, this.className) + ')';
	},
	_createNewFunc: function(Class) {
		return function(a, b, c, d, e, f, g, h) { //didnt want to do a dynamic version cuz function Name is lost
			return new Class(a, b, c, d, e, f, g, h);
		};
	},
	typePrefix: function() {
		if(this.className == 'UltimateModel') return 'model_';
		else if(this.className == 'UltimateForm') return 'form_';	
		else if(this.Parent.is('form') && !this.Parent.is('model')) return 'form_';
		else if(this.Parent.is('model')) return 'model_';
		else if(this.Parent.is('component')) return 'component_';
		
		else return '';
	}
});


InheritanceHelper.extendStatic({
	//KEEP THIS UP TO DATE IF NEW PROPS ARE ADDED TO THE CLASS OR PROTOTYPE ABOVE!!!
	reservedWordsRegex: /^(construct|class|className|__type|parent|constructor|classCreated|___proto|createNew)$/,
	usesReservedWord: function(prop) {
		return this.reservedWordsRegex.test(prop);
	}
});