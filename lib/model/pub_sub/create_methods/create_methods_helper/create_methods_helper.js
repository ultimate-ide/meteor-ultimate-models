Ultimate('CreateMethodsHelper').extends({
	exec: function(callback) {
		if(Meteor.isServer) return this.execAggregateSync();
		else if(Meteor.isClient && callback) this.execAggregateAsync(callback);
		else if(Meteor.isClient) return this.findAggregateResult();
	};
	
	execAggregateAsync: function(selector, callback, fk, groupClassName, options) {	
		Meteor.call('execAggregateAsync', selector, this.modelClassName, fk, groupClassName, options, function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},
	
	
	findAggregateResult: function(agg) {
		var selector = this._getFindSelector(agg),
			latestAggValue =  UltimateAggregates.findOne(selector, {sort: {updated_at: -1}});
	
		this._removeStalePublishedAggregates(selector);
	
		return latestAggValue ? latestAggValue.result : 0;
	},
	
	
	_getFindSelector: function(selector) {
		this.aggregate.collection = this.collection._name; //info for selecting later in UltimateAggregates collection
		return this.aggregate;
	}
	_removeStalePublishedAggregates: function(selector) {
		UltimateAggregates._collection.remove(selector, {sort: {updated_at: -1}, skip: 1});
	}
});