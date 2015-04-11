Ultimate('UltimateBehavior').extends(UltimateFacade, {
	isBehavior: true,
	ownerContext: false, 
	
	
	construct: function(doc, owner) {
		if(doc) _.extend(this, doc);
		this.mixinTo(owner);
		this._owner = owner;
	},
	owner: function() {
		return this._owner;
	},
	mixinTo: function(owner) {
		_.extend(owner, this.getMethods());
	},
	getMethods: function() {
		var methods = this.callParent('getMethods', null,  true, null, this.ownerContext),
			newMethods = {};
	
		_.each(methods, function(method, name) {
			if(name.indexOf('handle') !== 0) return;
			
			var newMethodName = name.replace('handle', '').lowercaseFirstLetter(),
				correctEnvironment = this._isCorrectEnvironment(environment);
				
			newMethods[newMethodName] = function() {
				if(correctEnvironment) return method.apply(this, arguments)
			};
		});
	
		return newMethods;
	},
	removeSelfAsBehavior: function() {
		_.each(this.getMethods(), function(method) {
			delete this._owner[method];
		});
		delete this._owner;
	},
	
	
	assignProxyMethod: function(methodName, prop, enviornment) {
		this._owner[methodName] = function() {
			return this.returnBehavior(prop, environment);
		};
	},
	returnBehavior: function(prop, environment) {
		return this._isCorrectEnvironment(environment) ? this._owner[prop] : this;
	},
	_isCorrectEnvironment: function(env) {
		if(env && environment.toLowerCase() == 'client' && Meteor.isServer) return true;
		if(env && environment.toLowerCase() == 'server' && Meteor.isClient) return true;
	},
});