Base = function Base() {};
Base.parent = null;
Base.className = 'Base';
Base.__type = 'class_Base';
Base.construct = Base;


Base.extend({
	parentConstruct: function() {
		return this.parent.construct.apply(this, arguments);
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
		
		return EJSON.parse(str); //deep copy while removing functions; may not be needed since Meteor.call may handle it
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
		return this.parent['construct'].apply(this, arguments);
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
	
	getFormSchema: function(name) {
		return this._forms[name];
	},
	
	_context: function(formName) {
		var schema = this.getFormSchema(formName), 
			ctx = formName ? schema.namedContext(formName) : schema.newContext();
			
		return ctx;
	},
	
	validate: function(formName) { 
		var ctx = this._context(formName);
	  return ctx.validate(this);
	},
	
	validateForm: function(formName) {
		AutoForm.validateForm(formName);
		this.flashMessages(formName);
	},
	
	errorMessages: function(formName) { 
	   var ctx = this._context(formName);
		 return ctx.getErrorObject(); //full of all messages
	},
	flashMessages: function(formName) {
		var errors = this.errorMessages(formName);
		
		messages = _.map(errors, function(error) {
			return error.message + '<br />';
		});
		
		Flash.danger(messages);
	},
	
	invalidKeys:function(formName) {
		var ctx = this._context(formName);
		return ctx.invalidKeys(); //eg:  {name: "zipcode", type: "required", value: null}
	},
	
	addInvalidKeys: function(formName, keys) {
		this._context(formName).addInvalidKeys(keys);
	},
	addInvalidKey: function(formName, key) {
		this._context(formName).addInvalidKeys([key]);
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
