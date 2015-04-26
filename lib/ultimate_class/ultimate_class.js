UltimateClass = function UltimateClass() {};

UltimateClass.extendStatic({
	parent: null,
	className: 'UltimateClass',
	__type: 'class_UltimateClass',
	construct: UltimateClass,
	isUltimate: true,
	isStatic: true,
	
	is: function(type) { 
		var isType = 'is'+type.capitalizeFirstLetter();			
		return this.prototype[isType];
	},
	isClassName: function(className) {
		return this.className == className;
	},
	isChildOf: function(className) {
		function checkParent(Class) {
			if(Class.parent && Class.parent.className == className) return true;
			else if(Class.parent) return checkParent(Class.parent);
			else return false;
		} 
		
		return checkParent(this);
	},
	isAbstract: function() {
		return this.prototype.isAbstract();
	},
	isClassCreated: function() {
		return this.prototype.isClassCreated();
	}
});

UltimateClass.extend({	
	parent: null,
	className: 'UltimateClass',
	__type: 'instance_UltimateClass',
	construct: UltimateClass,
	abstract: true,
	isUltimate: true,
	isUltimatePrototype: true,

	is: function(type) {
		var isType = 'is'+type.capitalizeFirstLetter();
		return this[isType];
	},
	isClassName: function(className) {
		return this.className == className;
	},
	isChildOf: function(className) {
		function checkParent(Class) {
			if(Class.parent && Class.parent.className == className) return true;
			else if(Class.parent) return checkParent(Class.parent);
			else return false;
		} 
		
		return checkParent(this);
	},
	isAbstract: function() {
		return this.___proto.hasOwnProperty('abstract');
	},
	isClassCreated: function() {
		return this.___proto.hasOwnProperty('classCreated');
	},
	
	callParent: function(methodName) {
		var args = _.toArray(arguments),
			methodName = args.shift();
	
		return this._resolveParentMethod(methodName).apply(this, args);
	},
	applyParent: function(methodName, args) {
		return this._resolveParentMethod(methodName).apply(this, args);
	},
	
	callParentConstructor: function() {
		return this._resolveParentMethod('construct').apply(this, arguments);
	},
	applyParentConstructor: function(args) {
		return this._resolveParentMethod('construct').apply(this, args);
	},
	_resolveParentMethod: function(methodName) {
		if(this.protoHasOwnProperty(methodName)) return this.parent[methodName];
		else {
			var parentMethod,
				parent = this.parent;
			
			while(!parentMethod) { //allow for using the Template Design Pattern, so inherited methods can call true parents
				if(parent.protoHasOwnProperty(methodName)) parentMethod = this.parent.parent[methodName];
				parent = parent.parent;
			}
			
			return parentMethod;
		}
	},
	
	
	setNonSaveable: function(key, val) {
		this['___'+key] = val;
	},
	getNonSaveable: function(key) {
		return this['___'+key];
	},
	
	
	extendWithDoc: function(doc) {
		_.extend(this, doc);
	},
	
	
	getPrototype: function() {
		return this.___proto;
	},
	protoHasOwnProperty: function(prop) {
		return this.___proto.hasOwnProperty(prop);
	},
	isPrivateMethod: function(prop) {
		return prop.indexOf('_') === 0;
	},
	usesReservedWord: function(prop) {
		return InheritanceHelper.reservedWordsRegex.test(prop);
	},
	isUltimate: function() {
		return !!this.__type;
	}
});


//CLASS LEVEL STATIC METHODS (ONLY AT THE FUNCTION.PROTOTYPE LEVEL CAN THEY BE INHERITED UNFORTUNATELY
Function.extend({
	callParent: function() {
		var args = _.toArray(arguments),
			methodName = args.shift();

		return this.parent[methodName].apply(this, args);
	},
	applyParent: function(methodName, args) {
		return this.parent[methodName].apply(this, args);
	}
});