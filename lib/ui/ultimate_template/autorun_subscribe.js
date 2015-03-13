UltimateTemplate.extend({
	_getAutorun: function(UT) {
		var ar = null;
		
		if(UT.___proto.hasOwnProperty('autorun')) {
			var autorun = UT.___proto.autorun;
			delete UT.___proto.autorun;
			
			ar = function() {
				this.autorun(function(c) {
					autorun.call(this, c); 
				}.bind(this));
			}.bind(this);
		}
		
		return ar;
	},
	_getSubscribe: function(UT) {
		var sub = null;
		
		if(UT.___proto.hasOwnProperty('subscribe')) {
			var subscribeParams = UT.___proto.subscribe;
			delete UT.___proto.subscribe;
			
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
	_getSubscribeLimit: function(UT) {
		var sub = null;
		
		if(UT.___proto.hasOwnProperty('subscribeLimit')) {
			var subscribeParams = UT.___proto.subscribeLimit;
			delete UT.___proto.subscribeLimit;
			
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
	}
});