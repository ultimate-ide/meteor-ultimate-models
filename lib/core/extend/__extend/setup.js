Setup = function Setup(proto, methods) {
	this.proto = proto;
	this.methods = methods;
};

Setup.prototype = {
	onStartup: function() {
		Meteor.startup(function() {
			this.methods.onStartup.call(this.proto)
		}.bind(this));
	},
	defineErrorMessages: function() {
		var messages = this.methods.defineErrorMessages.call(this.proto);
		SimpleSchema.messages(messages);
	},
	schema: function() {
		var proto = this.proto,
			schema = this.methods.schema.call(proto);
	
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
			forms = this.methods.forms.call(proto);
			
		proto._forms = proto._forms || {};

		for(var name in forms) {
			var form = forms[name],
				keys = form.keys,
				onSubmit = form.onSubmit;

			proto._forms[name] = proto._forms[name] || {};	
			proto._forms[name].schema = proto._subSchema(keys);
			proto._forms[name].keys = keys;
			proto._forms[name].onSubmit = onSubmit;


	    if(Meteor.isClient) this._prepareOnSubmit(proto, onSubmit, keys);
		}
	},
	_prepareOnSubmit: function(proto, onSubmit, keys) {
    (function(onSubmit) {
			
	    AutoForm.addHooks([name], {	
				onError: function(operation, error, template) {
					Flash.danger(error.message);
				},
	      onSubmit: function(data, modifier, model) {		
					try {
						_.extend(model, data);				
						model = new window[model.className](model);		
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

