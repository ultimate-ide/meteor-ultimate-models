Base = this.Base = function Base() {};
Base.parent = null;
Base.className = 'Base';
Base.__type = 'class_Base';
Base.construct = Base;


Base.extend({
	get: function(prop) {
		this.depend();
		return this[prop];
	},
	set: function(prop, val) {
		this[prop] = val;
		this.changed();
	},
	depend: function() {
		this.___dep.depend();
	},
	changed: function() {
		this.___dep.changed();
	},
	

	transformClient: function() { 
		this.__type = this.__type; //tack these props from the prototype on the actual instance
		this.className = this.className; //so they will be stringified below
		
		try {
			var str = EJSON.stringify(this);
		}
		catch(e) {
			var msg = 'MOST LIKELY A CIRCULAR REFERENCE ISSUE. ';
			msg += 'YOU CANNOT COMPOSE OBJECTS OF OBJECTS THAT REFERENCE THE INITIAL COMPOSER, ETC. SORRY.'
			throw new Meteor.Error('circular-reference', msg);
		}
		
		var obj = EJSON.parse(str); //deep copy while removing functions; may not be needed since Meteor.call may handle it
		
		delete obj.___dep;
		delete obj._local;
		return obj;
	},
	transformServer: function(clientObj) {
		function iterate(obj, serverObj) {
		    for(var prop in obj) {
          if(obj[prop].__type)  { //instance extended from our classes
						var className = obj[prop].className,
							newObj = new GlobalScope[className]('no_params');
			
						serverObj[prop] = newObj.transformServer(obj[prop]); //recursively transform this nested instance
          } 
					else {
						if(typeof obj[prop] == "object") serverObj[prop] = iterate(obj[prop], {}); //standard objects
						else serverObj[prop] = obj[prop]; //basic types
					}
		    }
				return serverObj;
		}	
		
		return iterate(clientObj, this);
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
	
	
	setTimeout: function(func, delay) {
		return Meteor.setTimeout(func.bind(this), delay);
	},
	setInterval: function(func, delay) {
		return Meteor.setInterval(func.bind(this), delay);
	},
	setIntervalUntil: function(func, delay, maxCalls) {
		var isComplete = false,
			startTime = new Date,
			maxCalls = maxCalls || 1000,
			maxMs = delay * maxCalls,
			interval = Meteor.setInterval(function() {
				isComplete = func.call(this);
				if(isComplete) this.clearInterval(interval);
				
				if((new Date) - startTime > maxMs) this.clearInterval(interval);
			}.bind(this), delay);
	},
	clearTimeout: function(id) {
		Meteor.clearTimeout(id);
	},
	clearInterval: function(id) {
		Meteor.clearInterval(id);
	},
	
	makeSync: function() {
		var args = _.toArray(arguments);
	
		if(_.isString(args[0])) {
			var method = args[0];
			return UltimateSync.makeSync(this, method);
		}
		else {
			var context = args[0],
				method = args[1];
			
			return UltimateSync.makeSync(context, method);
		}
	},
	applySync: function() {
		var args = _.toArray(arguments);
		
		if(_.isString(args[0])) {
			var method = args[0],
				args = args[1];
			
			return UltimateSync.applySync(this, method, args);
		}
		else {
			var context = args[0],
				method = args[1],
				args = args[2];
			
			return UltimateSync.applySync(context, method, args);
		}
	},
	
	POST: function() {
		return UltimateSync.post.apply(UltimateSync, arguments);
	},
	GET: function() {
		return UltimateSync.get.apply(UltimateSync, arguments);
	},
	PUT: function() {
		return UltimateSync.put.apply(UltimateSync, arguments);
	},
	DEL: function() {
		return UltimateSync.del.apply(UltimateSync, arguments);
	},
	
	_subSchema: function() {
		var args = _.toArray(arguments);
		args = _.isArray(args[0]) ? args[0] : args;
		
		return this._schema.pick(args);
	},
	
	
	getForm: function(name) {
		return this._forms[name];
	},
	getFormKeys: function(name) {
		return this.getForm(name) ? this.getForm(name).keys : null;
	},
	getFormSchema: function(name) {
		return this.getForm(name) ? this.getForm(name).schema : null;
	},
	getFormOnSubmit: function(formName) {
		return this.getForm(name) ? this.getForm(name).onSubmit : null;
	},


	setCurrentForm: function(formName) {
		this.___formName = formName;
	},
	getCurrentForm: function(formName) {
		if(formName) return formName;
		else return this.___formName || $('form.ultimate-form').last().attr('id'); 
	},
	getCurrentFormOnSubmit: function(formName) {
		var name = this.getCurrentForm(formName);
		return this._forms[name].onSubmit;
	},
	callCurrentFormOnSubmit: function(formName) {
		var onSubmit = this.getCurrentFormOnSubmit(formName);
		if(onSubmit) onSubmit.call(this, {done: function() {}})
	},
	
	
	_context: function(formName) {
		formName = this.getCurrentForm(formName);
		
		var schema = this.getFormSchema(formName), 
			ctx = formName ? schema.namedContext(formName) : schema.newContext();
			
		return ctx;
	},
	
	validate: function(formName) { 
		formName = this.getCurrentForm(formName);
		
		var ctx = this._context(formName),
			obj = this.getMongoAttributesForFields(ctx._schemaKeys),
			isValid = ctx.validate(obj);
			
		return this.getErrorMessages(formName);
	},
	
	validateForm: function(formName) {
		formName = this.getCurrentForm(formName);
		
		AutoForm.validateForm(formName);
		this.flashMessages(formName);
		
		return this.getErrorMessages(formName);
	},
	
	getFormValues: function(formName) {
		formName = this.getCurrentForm(formName);
		
		return AutoForm.getFormValues(formName).insertDoc;
	},
	
	getErrorMessages: function(formName) { 
		formName = this.getCurrentForm(formName);
		
		var ctx = this._context(formName);
		
		return _.map(this.invalidKeys(formName), function(key) {
			return ctx.keyErrorMessage(key);
		});
	},
	getFlashMessages: function(formName) {
		formName = this.getCurrentForm(formName);
		
		var errors = this.getErrorMessages(formName),
			messages = '';
		
		console.log('ERRORS', errors);
		
		if(errors.length > 1) {
			messages += '<ul style="list-style:initial; margin-left: 12px">'
			
			_.each(errors, function(error) {
				messages += '<li>' + error + '</li>';
			});
			
			messages += '</ul>'
		}
		else if(errors.length == 1) messages = errors[0];
		
		return messages;
	},
	showFlashMessages: function(formName) {
		formName = this.getCurrentForm(formName);
		
		var errorMessages = this.getFlashMessages();
		if(errorMessages) Flash.danger(errorMessages);
		else Flash.clear();
	},
	
	invalidKeys:function(formName) {
		formName = this.getCurrentForm(formName);
		
		var ctx = this._context(formName);
		
		return _.map(ctx.invalidKeys(), function(keyObj){
			return keyObj.name;
		});
	},
	
	addInvalidKeys: function(formName, keys) {
		if(!keys) {
			keys = formName;
			formName = this.getCurrentForm();
		}
		
		this._context(formName).addInvalidKeys(keys);
	},
	addInvalidKey: function(formName, key) {
		if(!key) {
			key = formName;
			formName = this.getCurrentForm();
		}
		
		this._context(formName).addInvalidKeys([key]);
	},
	
	getAsyncFuncForField: function(field) {
		return this.___customAsyncs[field];
	},
	
	prepareErrorType: function(errorType) {
		if(errorType.indexOf(' ') > 0) {
			var error = {},
				message = errorType,
				type = 'error'+message.substr(0, 15);
		
			type = type.replace(/ /g, '');
				
			error[type] = message;
			console.log('PREPARE ERROR TYPE', error);
			SimpleSchema.messages(error);
			
			errorType = type;
		}
		return errorType;
	},
	
	__applyOnSubmit: function(onSubmit, model, autoform, schemaFields) {
		var allAsyncs = this.___customAsyncs,
			customAsyncs = [],
			finalOnSubmit = this.__finalOnSubmit;

		_.each(schemaFields, function(field) {
			if(allAsyncs && allAsyncs[field]) customAsyncs.push({field: field, func: allAsyncs[field]});
		});	

		var hookInfo = {
				asyncTotal: customAsyncs.length, 
				timesCalled: 0,
				autoform: autoform,
				model: model,
				onSubmit: onSubmit
			};
			
		if(customAsyncs.length > 0) {
			_.each(customAsyncs, function(async) {
				var func = async.func,
					field = async.field,
					obj = {field: field, hook: hookInfo};
				
				func.apply(model, [finalOnSubmit.bind(obj)]);
			});
		}
		else finalOnSubmit.apply({hook: hookInfo}, [null]);
	},
	__finalOnSubmit: function(errorType) {
		this.hook.timesCalled++;
		console.log('FINAL ON SUBMIT', errorType, this.hook.timesCalled, this.hook.asyncTotal);
		
		if(errorType) {
			errorType = this.hook.model.prepareErrorType(errorType);
			//this.hook.autoform.done(new Error(errorType));
			this.hook.model.addInvalidKey({name: this.field, type: errorType});
		}
		else {
			if(this.hook.timesCalled < this.hook.asyncTotal) return;
	
			if(this.hook.onSubmit) this.hook.onSubmit.apply(this.hook.model, [this.hook.autoform]);
			else {
				this.hook.model.persist();
				this.hook.autoform.done(null, this.hook.model);
			}
		}
	},
	__validateAsync: function(errorType) {
		if(errorType) {
			errorType = this.prepareErrorType(errorType);
			this.addInvalidKey({name: this.field, type: errorType});
		}
	}
});


//CLASS LEVEL STATIC METHODS (ONLY AT THE FUNCTION.PROTOTYPE LEVEL CAN THEY BE INHERITED UNFORTUNATELY)

Function.prototype.callParent = function() {
	var args = _.toArray(arguments),
		methodName = args.shift();

	return this.parent[methodName].apply(this, args);
};

Function.prototype.applyParent = function(methodName, args) {
	return this.parent[methodName].apply(this, args);
};


Function.prototype.setTimeout = function(func, delay) {
	return Meteor.setTimeout(func.bind(this), delay);
};

Function.prototype.setInterval = function(func, delay) {
	return Meteor.setInterval(func.bind(this), delay);
};

Function.prototype.setIntervalUntil = function(func, delay) {
	var isComplete = false,
		interval = Meteor.setInterval(function() {
			isComplete = func.bind(this);
		}.bind(this), delay);
		
	if(isComplete) this.clearInterval(interval);
};

Function.prototype.clearTimeout = function(id) {
	Meteor.clearTimeout(id);
};

Function.prototype.clearInterval = function(id) {
	Meteor.clearInterval(id);
};

Function.prototype.makeSync = function() {
	var args = _.toArray(arguments);
	
	if(_.isString(args[0])) {
		var method = args[0];
		return UltimateSync.makeSync(this, method);
	}
	else {
		var context = args[0],
			method = args[1];
			
		return UltimateSync.makeSync(context, method);
	}
};

Function.prototype.applySync = function() {
	var args = _.toArray(arguments);
	
	if(_.isString(args[0])) {
		var method = args[0],
			args = args[1];
			
		return UltimateSync.applySync(this, method, args);
	}
	else {
		var context = args[0],
			method = args[1],
			args = args[2];
			
		return UltimateSync.applySync(context, method, args);
	}
};


Function.prototype.POST = function() {
	return UltimateSync.post.apply(UltimateSync, arguments);
};

Function.prototype.GET = function() {
	return UltmateSync.get.apply(UltimateSync, arguments);
};

Function.prototype.PUT = function() {
	return UltimateSync.put.apply(UltimateSync, arguments);
};

Function.prototype.DEL = function() {
	return UltimateSync.del.apply(UltimateSync, arguments);
};
