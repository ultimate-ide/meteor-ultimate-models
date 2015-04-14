UltimateModel.extend({	
	createAggregateMethods: function() {
		_.each(this.___proto.relations, function(rel) {
			_.each(rel.aggregates, function(name) {
				var agg = UltimateClone.deepClone(rel.model.prototype.aggregates[name]);
				this._createAggregateMethod(name, agg, rel);
			});
		}, this);
	},
	_createAggregateMethod: function(name, agg, rel) {
		this.___proto[name] = function(callback) {			
			var helper = new CreateInstanceMethodsHelper(this, agg, rel);
				
			if(Meteor.isServer) return helper.execAggregateSync();
			else if(Meteor.isClient && callback) helper.execAggregateAsync(callback);
			else if(Meteor.isClient) return helper.findAggregateResult();
		};
	}
});