UltimateModel.extend({	
	createAggregateClassMethods: function() {
		_.each(this.___proto.aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateClassMethod(name, agg);
		}, this);
	},
	
	
	_createAggregateClassMethod: function(name, agg) {
		this.class[name] = function(field, selector, callback) {		
			var callback = _.callbackFromArguments(arguments);
			
			agg = _.isString(field) ? helper._prepareBasicAggregate(name, field, selector) : agg;
			
			if(!this._group) {
				var helper = new CreateClassMethodsHelper(this, agg);
				
				if(Meteor.isServer) return helper.execAggregateSync();
				else if(Meteor.isClient && callback) helper.execAggregateAsync(callback);
				else if(Meteor.isClient) return helper.findAggregateResult();
			}
			else {
				var helper = new CreateGroupByMethodsHelper(this, agg);
				
				if(Meteor.isServer) return helper._execGroupByAggregateSync();
				else if(Meteor.isClient && callback) helper._execGroupByAggregateAsync(callback);
				else if(Meteor.isClient) return helper._findGroupByAggregateResult(result);
			
				this._group = this._groupBySelector = this._groupByOptions = null;
			}
		}.bind(this);
	}
});