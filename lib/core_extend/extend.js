Function.prototype.extend = function(methods) { 
	this.__extend(this.prototype, methods);
};

Function.extend({
	extendStatic: function(methods) {
		this.__extend(this, methods);
	},
	
	extendHTTP: function(methods) {
		var constructClient = null;
	
		if(methods['constructClient']) {
			constructClient = methods['constructClient'];
			delete methods['constructClient'];
		}
	
		var http = new UltimateHTTP(this, methods, constructClient);
		http.connect();
	},
	extendStaticHTTP: function(methods) {
		var http = new UltimateHTTP(this, methods, null, true);
		http.connect();
	},
	
	
	extendServer: function(methods) {
		if(!Meteor.isServer) return;
		this.__extend(this.prototype, methods);
	},
	extendServerStatic: function(methods) {
		if(!Meteor.isServer) return;
		this.__extend(this, methods);
	},
	
	
	extendClient: function(methods) {
		if(!Meteor.isClient) return;
		this.__extend(this.prototype, methods);
	},
	extendClientStatic: function(methods) {
		if(!Meteor.isClient) return;
		this.__extend(this, methods);
	}
});