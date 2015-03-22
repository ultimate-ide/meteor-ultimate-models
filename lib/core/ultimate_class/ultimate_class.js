UltimateClass = function UltimateClass() {};

UltimateClass.extendStatic({
	parent: null,
	className: 'UltimateClass',
	__type: 'class_UltimateClass',
	construct: UltimateClass,
	
	is: function(type) {
		type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
		var isType = 'is'+type;			
		return this.prototype[isType];
	}
});

UltimateClass.extend({	
	parent: null,
	className: 'UltimateClass',
	__type: 'instance_UltimateClass',
	construct: UltimateClass,


	is: function(type) {
		type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
		var isType = 'is'+type;
		return this[isType];
	},
	
	
	callParent: function() {
		var args = _.toArray(arguments),
			methodName = args.shift();
	
		return this.parent[methodName].apply(this, args);
	},
	applyParent: function(methodName, args) {
		return this.parent[methodName].apply(this, args);
	},
	
	callParentConstructor: function() {
		return this.parent.construct.apply(this, arguments);
	},
	applyParentConstructor: function(args) {
		return this.parent.construct.apply(this, args);
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
	
	
	protoHasOwnProperty: function(prop) {
		return this.___proto.hasOwnProperty(prop);
	},
	isPrivateMethod: function(prop) {
		return prop.indexOf('_') === 0;
	},
	isUltimate: function() {
		return !!this.__type;
	},
	composeBehavior: function(prop, Class, stubType) {
		if(stubType) {
			if(stubType.toLowerCase() == 'client' && Meteor.isClient) return this[prop];
			if(stubType.toLowerCase() == 'server' && Meteor.isServer) return this[prop];
		}
		
		if(!this[prop]) return this[prop] = new Class(null, this); //this is the first time the wrapper/object is being used
		else return this[prop].isUltimate() ? this[prop] : (this[prop] = new Class(this[prop], this)); //wrapped as EC2 object : not wrapped
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