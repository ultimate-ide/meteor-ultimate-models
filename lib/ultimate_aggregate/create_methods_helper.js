Ultimate('CreateAggregateMethodsHelper').extends({
	exec: function(callback) {
		if(Meteor.isServer) return this.execAggregateSync();
		else if(Meteor.isClient && callback) this.execAggregateAsync(callback);
		else if(Meteor.isClient) return this.findAggregateResult();
	},
	execAggregateAsync: function(selector, callback, fk, groupClassName, options) {	
		Meteor.call('execAggregateAsync', selector, this.modelClassName, fk, groupClassName, options, function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},	
	findAggregateResult: function() {
		var selector = this._getFindSelector(),
			latestAggValue =  UltimateAggregates.findOne(selector, {sort: {updated_at: -1}});

		return latestAggValue ? latestAggValue.result : 0;
	},
	_getFindSelector: function() {
		this.aggregate.collection = this.collection._name; //info for selecting later in UltimateAggregates collection
		return this.aggregate;
	}
});