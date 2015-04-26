UltimateReactive.extend({
	runReactiveMethods: function() {
		if(this.hasOwnProperty('autorun')) this.autorunHandler = this.autorun; //this === this.___proto in onBeforeStartup
		if(this.hasOwnProperty('subscribe')) this.subscribeHandler = this.subscribe;
		if(this.hasOwnProperty('subscribeLimit')) this.subscribeLimitHandler = this.subscribeLimit;

		delete this.autorun; //must delete so child classes can call this.autorun, for example, and use the correct one lower in the proto chain
		delete this.subscribe;
		delete this.subscribeLimit;

		if(this.subscribeLimitHandler) this.autorun(this._runSubscribeLimit(this.subscribeLimitHandler));
		if(this.subscribeHandler) this.autorun(this._runSubscribe(this.subscribeHandler));
		if(this.autorunHandler) this.autorun(this.autorunHandler);
	},
	
	
	_runSubscribe: function(subscribeParams) {
		if(_.isFunction(subscribeParams)) return subscribeParams;
		
		if(_.isString(subscribeParams)) subscribeParams = this.__convertStringToArrayParams(subscribeParams);
		
		return function(computation) {
			subscribeParams = this.__evalParams(subscribeParams);	
			Meteor.subscribe.apply(Meteor, subscribeParams);
		};
	},
	_runSubscribeLimit: function(subscribeParams) {
		if(_.isFunction(subscribeParams)) var subFunc = subscribeParams;
		
		if(_.isString(subscribeParams)) subscribeParams = this.__convertStringToArrayParams(subscribeParams);
				
		if(_.isArray(subscribeParams)) {
			var subFunc = function(computation, limit) {
				subscribeParams = this.__evalParams(subscribeParams);	
				subscribeParams.push(limit);
				return Meteor.subscribe.apply(Meteor, subscribeParams);
			};
		}
		
		return function(computation) {
			this._limitSubscribe = subFunc.call(this, computation, this.getLimit()); 
		};
	},
	
	
	__convertStringToArrayParams: function(subscribeParams) {
		return _.map(subscribeParams.split(','), function(param) {
			return param.trim();
		});
	},
	__evalParams: function(subscribeParams) {
		return _.map(subscribeParams, function(param) {
			if(param.indexOf('@') > 0) return eval(param.substr(1));
			else return param;
		}, this);
	}
});