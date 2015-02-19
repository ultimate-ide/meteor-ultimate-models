Function.prototype.__extend = function(initialObject, methods) {
	var args = _.toArray(arguments),
		proto = args[0],
		meths = args[1];
	
	if(meths) {
		if(meths.onStartup) {
			var onStartup = meths.onStartup;
		
			Meteor.startup(function() {
				onStartup.call(initialObject)
			});
		}
		
		
		if(meths.onBeforeInsert) {
			var onBeforeInsert = meths.onBeforeInsert;
		
			var newFunc = function(userId, doc) {
				var model = this.transform();		
				onBeforeInsert.apply(model, [userId, this]);
				
				for(var prop in doc) delete doc[prop];	
				_.extend(doc, model.getMongoAttributes(true));
			};

			this.collection.before.insert(newFunc);
		}
		
		
		if(meths.onBeforeUpdate) {
			var onBeforeUpdate = meths.onBeforeUpdate;
		
			var newFunc = function(userId, doc, fieldNames, modifier, options) {
				if(doc._local || modifier._local) return; 
				
				var model = this.transform();		
				_.extend(model, modifier.$set);

				onBeforeUpdate.apply(model, [userId, this, fieldNames, modifier, options]);
				
				modifier.$set = model.getMongoAttributes(null, null, true);
			};

			this.collection.before.update(newFunc);
		}
		
		
		if(meths.onBeforeRemove) {
			var onBeforeRemove = meths.onBeforeRemove;
		
			var newFunc = function(userId, doc) {
				var model = this.transform();		
				onBeforeRemove.apply(model, [userId, this]);
			};

			this.collection.before.remove(newFunc);
		}
		
		
		if(meths.onAfterInsert) {
			var onAfterInsert = meths.onAfterInsert;
		
			var newFunc = function(userId, doc) {
				var model = this.transform();		
				model._id = model._id || this._id;
				onAfterInsert.apply(model, [userId, this]);
			};

			this.collection.after.insert(newFunc);
		}
		
		
		if(meths.onAfterUpdate) {
			var onAfterUpdate = meths.onAfterUpdate;
		
			var newFunc = function(userId, doc, fieldNames, modifier, options) {
				var model = this.transform();		
				onAfterUpdate.apply(model, [userId, this, fieldNames, modifier, options]);
			};

			this.collection.after.update(newFunc);
		}
		
		
		if(meths.onAfterRemove) {
			var onAfterRemove = meths.onAfterRemove;
		
			var newFunc = function(userId, doc) {
				var model = this.transform();		
				onAfterRemove.apply(model, [userId, this]);
			};

			this.collection.after.remove(newFunc);
		}
		
		
		if(meths.onBeforeFind) this.collection.before.find(meths.onBeforeFind);
		if(meths.onAfterFind) this.collection.after.find(meths.onAfterFind);
		if(meths.onBeforeFindOne) this.collection.before.findOne(meths.onBeforeFindOne);
		
		if(meths.onAfterFindOne) {
			var onAfterFindOne = meths.onAfterFindOne;
			
			var newFunc = function(userId, selector, options, doc) {
				var model = this.transform ? this.transform(doc) : doc;		
				onAfterFindOne.apply(model, [userId, selector, options, this]);
			};
			
			this.collection.after.findOne(newFunc);
		}
		
		
		if(meths.schema) {
			var schema = meths.schema.call(proto);
			
			for(var field in schema) {
				for(var prop in schema[field]) {
					var customFunc = schema[field][prop];
					
					if(prop == 'custom') {
						(function(customFunc) {
							schema[field][prop] = function() {
								var model = new proto.class;
								model[this.key] = this.value;
							
								for(var key in this.defintion) {
									model[key] = this.field(key).value;
								}
							
								var errorType = customFunc.apply(model, [this]);
							
								return errorType ? proto.prepareErrorType(errorType) : null;
							};
						})(customFunc);
						
					}
					else if(prop == 'customAsync') {
						proto.___customAsyncs = proto.___customAsyncs || {};
						proto.___customAsyncs[field] = customFunc;
						delete schema[field][prop];
					}
				}
			}
			
			proto._schema = new SimpleSchema(schema);
		}
		
		if(meths.defineErrorMessages) {
			var messages = meths.defineErrorMessages.call(proto);
			SimpleSchema.messages(messages);
		}
		
		if(meths.forms) {
			var forms = meths.forms.call(proto);
			proto._forms = proto._forms || {};
			
			for(var name in forms) {
				var form = forms[name],
					keys = form.keys,
					onSubmit = form.onSubmit;
				
				proto._forms[name] = proto._forms[name] || {};	
				
				proto._forms[name].schema = proto._subSchema(keys);
				proto._forms[name].keys = keys;
				proto._forms[name].onSubmit = onSubmit;
			
			
		    if(Meteor.isClient) {
			    (function(onSubmit) {
				    AutoForm.addHooks([name], {
							onError: function(operation, error, template) {
								Flash.danger(error.message);
								console.log('onError', operation, error);
							},
							
				      onSubmit: function(data, modifier, model) {		
								try {
									_.extend(model, data);				
									model = new window[model.className](model);		
									
									console.log('ON SUBMIT', model);		
											
									proto.__applyOnSubmit(onSubmit, model, this, keys);					
								} catch(e) {
									console.log('ERROR', e);
								}	
				        return false;
				      }
				    }, true);
			    })(onSubmit);
		    }
				
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