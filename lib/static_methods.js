Function.prototype.__extend = function(initialObject, methods) {
	var args = _.toArray(arguments);
	
	if(args[1]) {
		if(args[1].onStartup) {
			var onStartup = args[1].onStartup;
		
			Meteor.startup(function() {
				onStartup.call(initialObject)
			});
		}
		
		if(args[1].schema) {
			var proto = args[0],
				schema = args[1].schema.call(proto);
			
			proto._schema = new SimpleSchema(schema);
		}
		
		if(args[1].forms) {
			var proto = args[0],
				forms = args[1].forms.call(proto);
			
			proto._forms = proto._forms || {};
			
			for(var name in forms) {
				var keys = forms[name];
				proto._forms[name] = proto._subSchema(keys);
			}
		}
	}
	
	
	return _.extend.apply(_, args);
};

Function.prototype.extend = function(methods) { //for use after .extends()
	this.__extend(this.prototype, methods);
};

Function.prototype.extendServer = function(methods) {
	if(!Meteor.isServer) return;
	this.__extend(this.prototype, methods);
};

Function.prototype.extendClient = function(methods) {
	if(!Meteor.isClient) return;
	this.__extend(this.prototype, methods);
};

Function.prototype.extendHTTP = function(methods) {
	var constructClient = null;
	
	if(methods['constructClient']) {
		constructClient = methods['constructClient'];
		delete methods['constructClient'];
	}
	
	var baseHttp = new BaseHTTP(this, methods, constructClient);
	baseHttp.connect();
};

Function.prototype.extendStatic = function(methods) {
	this.__extend(this, methods);
};

Function.prototype.extendStaticServer = function(methods) {
	if(!Meteor.isServer) return;
	this.__extend(this, methods);
};

Function.prototype.extendStaticClient = function(methods) {
	if(!Meteor.isClient) return;
	this.__extend(this, methods);
};

Function.prototype.extendStaticHTTP = function(methods) {
	var baseHttp = new BaseHTTP(this, methods, null, true);
	baseHttp.connect();
};

Function.prototype.modelExtends = function(collection, methods) {
	var Class = this;
	
	_.extend(methods, methods.defaultValues, {collection: collection}); 
	delete methods.defaultValues;
	var model = Class.extends(Model, methods);
	
	model.__type = 'model_class_'+model.getClassName();
	model.prototype.__type = 'model_instance_'+model.getClassName();
	
	collection._transform = function(doc) {
	  return new model(doc);
	};
};

Function.prototype.getClassName = function() {
	if(this.className) return this.className;
	
	var name = this.toString();
	name = name.substr('function '.length);        
	return this._className = name.substr(0, name.indexOf('('));       
};