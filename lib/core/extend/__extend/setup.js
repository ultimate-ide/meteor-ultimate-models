globalScope = this; //globalScope is set right here as the first line of the package for all files in the package to use

Setup = function Setup(proto, methods) {
	this.proto = proto;
	this.methods = methods;
};

Setup.prototype = {
	onBeforeStartup: function() {
		this.methods.onBeforeStartup.call(this.proto);
	},
	onChildClassStartup: function() {
		if(this.proto.hasOwnProperty('onChildClassStartup')) { 
			if(this.proto.parent.onChildClassStartup) {
				
				this.proto.onChildClassStartup = function() { //make it so the new onChildClassStartup also calls the old one too
					this.proto.parent.onChildClassStartup.call(this.proto);
					this.proto.onChildClassStartup.call(this.proto);
				}.bind(this);
				
			}
		}
		
		if(!this.proto.hasOwnProperty('onChildClassStartup')) this.proto.onChildClassStartup.call(this.proto); //run on child classes only
	},
	onStartup: function() {
		Meteor.startup(function() {
			this.methods.onStartup.call(this.proto);
		}.bind(this));
	},
	defineErrorMessages: function() {
		var messages = _.isFunction(this.methods.defineErrorMessages) ? this.methods.defineErrorMessages.call(this.proto) : this.methods.defineErrorMessages;
		SimpleSchema.messages(messages);
	},
	schema: function() {
		var proto = this.proto,
			schema = _.isFunction(this.methods.schema) ? this.methods.schema.call(proto) : this.methods.schema;
	
		for(var field in schema) {
			for(var prop in schema[field]) {
				var customFunc = schema[field][prop];
			
				if(prop == 'custom') this._prepareCustomFunc(customFunc, proto, schema[field], schema);
				else if(prop == 'customAsync') {
					proto.___customAsyncs = proto.___customAsyncs || {};
					proto.___customAsyncs[field] = customFunc;
					delete schema[field][prop];
				}
			}
		}
	
		proto._schema = new SimpleSchema(schema);
	},
	_prepareCustomFunc: function(customFunc, proto, schemaField, schema) {
		(function(customFunc) {
			schemaField.custom = function() {
				var model = new proto.class;
				model[this.key] = this.value;
		
				for(var key in schema) {
					model[key] = this.field(key).value;
				}
		
				var errorType = customFunc.apply(model, [this]);
		
				return errorType ? proto.prepareErrorType(errorType) : null;
			};
		})(customFunc);
	},
	forms: function() {
		var proto = this.proto,
			forms = _.isFunction(this.methods.forms) ? this.methods.forms.call(proto) : this.methods.forms;
			
		proto._forms = proto._forms || {};

		for(var name in forms) {
			var form = forms[name],
				keys = form.keys,
				onSubmit = form.onSubmit;

			proto._forms[name] = proto._forms[name] || {};	
			proto._forms[name].schema = proto._subSchema(keys);
			proto._forms[name].keys = keys;
			proto._forms[name].onSubmit = onSubmit;


	    if(Meteor.isClient) this._prepareOnSubmit(proto, onSubmit, keys, name);
		}
	},
	_prepareOnSubmit: function(proto, onSubmit, keys, name) {
    (function(onSubmit) {
			
	    AutoForm.addHooks([name], {	
				onError: function(operation, error, template) {
					Flash.danger(error.message);
				},
	      onSubmit: function(data, modifier, model) {	
					try {		
						model = new window[model.className](data);		
						console.log('BLA BLA', model);
						proto.__applyOnSubmit(onSubmit, model, this, keys);					
					} catch(e) {
						console.log('ERROR', e);
					}	
	        return false;
	      }
	    }, true);
			
    })(onSubmit);
	}
};

