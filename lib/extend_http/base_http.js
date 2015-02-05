BaseHTTP = function BaseHTTP(Class, methods, constructClient, isStatic) {
	this.class = Class;
	this.instance = Class.prototype;
	this.InstanceOrClass = isStatic ? Class : Class.prototype;;
	this.__type = this.InstanceOrClass.__type;
	this.className = this.InstanceOrClass.className;
	this.isStatic = isStatic;
	this.methods = methods;
	this.constructClient = constructClient;
};

BaseHTTP.clientClasses = {};

BaseHTTP.extend = function(methods) { 
	_.extend(this.prototype, methods);
};

BaseHTTP.extend({
	connect: function() {
		this.extendServer(); //ADD ACTUAL SERVER METHODS

		var ClientStubs = {};
		for(var meth in this.methods) {	
			if(Meteor.isServer) { 
				this.generateMeteorMethod(meth);	//[METEOR_METHOD.JS]	
				this.generateServerStub(meth); //[STUB_OBJ.JS]
			}
		
			if(Meteor.isClient) {
				ClientStubs[meth] = this.generateClientStub(meth); //[METEOR_CALL.JS]
			}
		}

		this.extendClient(ClientStubs); //ADD OUR GENERATED CLIENT METHODS
	},
	
	extendServer: function(methods) {
		if(Meteor.server) _.extend(this.InstanceOrClass, this.methods);
	},
	extendClient: function(ClientStubs) {
		if(Meteor.isClient) _.extend(this.InstanceOrClass, ClientStubs);
	},
	
	addClientStubs: function(meths) { //[STARTUP.JS] - CALLED WHEN extendHTTP CALLED ONLY ON SERVER
		var ClientStubs = {};
		
		_.each(meths, function(meth) {
			ClientStubs[meth] = this.generateClientStub(meth); //[METEOR_CALL.JS]
		}.bind(this));
		
		this.extendClient(ClientStubs);
	},
	
	getParentClass: function() {
		return this.InstanceOrClass.__type.indexOf('model_') ? 'Model' : 'Base';
	}
});



