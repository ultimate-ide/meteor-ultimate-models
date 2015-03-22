Ultimate('UltimatePublish').extends({
	construct: function(publishFuncContext) {
		this._meteor = publishFuncContext;
		this.userId = this._meteor.userId;
		this.connection = this._meteor.connection;
	},
	onChildClassStartup: function() {
		var methods = this.getMethods();
			
		_.each(methods, function(method, name) {
			if(name.indexOf('null') === 0) name = null;
			Meteor.publish(name, function() {
				var ultimatePublish = this.createNew(this);
				return method.apply(ultimatePublish, arguments);
			});
		});
	},
	
	
	getMethods: function() {
		var methods = {};
	
		for(var prop in this) {
			if(this.isMethod(prop)) {
				methods[prop] = this[prop];
			}
		}
	
		if(this.self) {
			methods.self = function() {
				return this.publishSelf(this.self);
			};
		}
		
		if(this.roles) methods.roles = this.publishRoles;
		
		return methods;
	},
	isMethod: function(prop) {
		return _.isFunction(this[prop]) && this.protoHasOwnProperty(prop) && !this.isPrivateMethod(prop);
	},
	
	meteor: function() {
		return this._meteor;
	},
	user: function() {
		return Meteor.users.findOne(this.userId);
	},
	publishSelf: function(fields) {
		var options = fields ? {fields: fields} : {};
		return Meteor.users.find(this.userId, options);
	},
	publishRoles: function() {
		return Meteor.roles.find({});
	},
	
	
	added: function() {
		return this._meteor.added.apply(this._meteor, arguments);
	},
	changed: function() {
		return this._meteor.changed.apply(this._meteor, arguments);
	},
	removed: function() {
		return this._meteor.removed.apply(this._meteor, arguments);
	},	
	ready: function() {
		return this._meteor.ready.apply(this._meteor, arguments);
	},
	onStop: function() {
		return this._meteor.onStop.apply(this._meteor, arguments);
	},	
	error: function() {
		return this._meteor.error.apply(this._meteor, arguments);
	},
	stop: function() {
		return this._meteor.stop.apply(this._meteor, arguments);
	}
});