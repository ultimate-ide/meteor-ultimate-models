UltimateReactive.extend({
	runReactiveMethods: function() {
		var subscribe = this._getSubscribe(),
			subscribeLimit = this._getSubscribeLimit(),
			autorun = this._getAutorun();
		
		this._deleteChildPrototypeProps();
			
		if(subscribeLimit) subscribeLimit();
		if(subscribe) subscribe();
		if(autorun) autorun();
	},
	onChildClassStartup: function() {
		if(!this.blockReactiveStartup) this.runReactiveMethods();
	},
	
	_getAutorun: function() {
		var ar = null;
		
		if(this.___proto.hasOwnProperty('autorun')) {
			var autorun = this.___proto.autorun;

			ar = function() {
				this.autorun(function(computation) {
					autorun.call(this, computation); 
				}.bind(this));
			}.bind(this);
		}
		
		return ar;
	},
	_getSubscribe: function() {
		var sub = null;
		
		if(this.___proto.hasOwnProperty('subscribe')) {
			var subscribeParams = this.___proto.subscribe;

			if(_.isFunction(subscribeParams)) sub = subscribeParams;
			else {
				if(_.isString(subscribeParams)) { //usually an array already is provided
					subscribeParams = _.map(subscribeParams.split(','), function(param) {
						return param.trim();
					});
				}
				
				sub = function(computation) {
					subscribeParams = _.map(subscribeParams, function(param) {
						if(param.indexOf('@') > 0) return eval(param.substr(1));
						else return param;
					});
					
					Meteor.subscribe.apply(Meteor, subscribeParams);
				};
			}
			
			return function() {
				this.autorun(function(computation) {
					sub.call(this, computation); 
				}.bind(this));
			}.bind(this);
		}
	},
	_getSubscribeLimit: function() {
		var sub = null;
		
		if(this.___proto.hasOwnProperty('subscribeLimit')) {
			var subscribeParams = this.___proto.subscribeLimit;

			if(_.isFunction(subscribeParams)) sub = subscribeParams;
			else {
				if(_.isString(subscribeParams)) { //usually an array already is provided
					subscribeParams = _.map(subscribeParams.split(','), function(param) {
						return param.trim();
					});
				}
				
				sub = function(computation, limit) {
					subscribeParams = _.map(subscribeParams, function(param) {
						if(param.indexOf('@') > 0) return eval(param.substr(1));
						else return param;
					});
					
					subscribeParams.push(limit);
					
					return Meteor.subscribe.apply(Meteor, subscribeParams);
				};
			}
			
			return function() {
				this.autorun(function(computation) {
					var limit = this.getLimit();	
					this._limitSubscribe = sub.call(this, computation, limit); 
				}.bind(this));
			}.bind(this);
		}
	},
	
	
	//must delete those child classes can call this.autorun, for example, and use the correct one lower in the proto chain
	_deleteChildPrototypeProps: function() {
		delete this.___proto.autorun; 
		delete this.___proto.subscribe; 
		delete this.___proto.subscribeLimit; 
	}
});