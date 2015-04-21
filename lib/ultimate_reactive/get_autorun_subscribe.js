UltimateReactive.extend({
	onBeforeStartup: function() {
		if(this.hasOwnProperty('autorun')) this.autorunHandler = this.autorun; //this === this.___proto in onBeforeStartup
		if(this.hasOwnProperty('subscribe')) this.subscribeHandler = this.subscribe;
		if(this.hasOwnProperty('subscribeLimit')) this.subscribeLimitHandler = this.subscribeLimit;
		
		this._deleteChildPrototypeProps();
	},
	_deleteChildPrototypeProps: function() { //must delete those child classes can call this.autorun, for example, and use the correct one lower in the proto chain
		delete this.autorun; //this === this.___proto in onBeforeStartup
		delete this.subscribe; 
		delete this.subscribeLimit; 
	},
	
	
	runReactiveMethods: function() {
		if(this.subscribeLimitHandler) this.autorun(this._runSubscribeLimit());
		if(this.subscribeHandler) this.autorun(this._runSubscribeLimit());
		if(this.autorunHandler) this.autorun(this.autorunHandler);
	},
	
	
	_runSubscribe: function() {
		var subscribeParams = this.subscribeHandler;

		if(_.isFunction(subscribeParams)) return this.autorun(subscribeParams);
		
		if(_.isString(subscribeParams)) { //usually an array already is provided
			subscribeParams = _.map(subscribeParams.split(','), function(param) {
				return param.trim();
			});
		}
		
		return function(computation) {
			subscribeParams = _.map(subscribeParams, function(param) {
				if(param.indexOf('@') > 0) return eval(param.substr(1));
				else return param;
			});
			
			Meteor.subscribe.apply(Meteor, subscribeParams);
		};
	},
	_runSubscribeLimit: function() {
		var subFunc = null,
			subscribeParams = this.subscribeLimitHandler;

		if(_.isFunction(subscribeParams)) subFunc = subscribeParams;
		
		if(_.isString(subscribeParams)) { //convert to Array handler version below
			subscribeParams = _.map(subscribeParams.split(','), function(param) {
				return param.trim();
			});
		}
				
		if(_.isArray(subscribeParams)) {
			subFunc = function(computation, limit) {
				subscribeParams = _.map(subscribeParams, function(param) {
					if(param.indexOf('@') > 0) return eval(param.substr(1));
					else return param;
				});
			
				subscribeParams.push(limit);
			
				return Meteor.subscribe.apply(Meteor, subscribeParams);
			};
		}
		
		return function(computation) {
			this._limitSubscribe = subFunc.call(this, computation, this.getLimit()); 
		};
	}
});