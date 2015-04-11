UltimateModel.extend({	
	createAggregateClassMethods: function() {
		_.each(this.___proto.aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateClassMethod(name, agg);
		}, this);
	},
	
	
	_createAggregateClassMethod: function(name, agg) {
		this.class[name] = function(callback) {				
			if(Meteor.isServer) return this._execClassAggregateSync(agg);
			else if(Meteor.isClient && callback) this._execClassAggregateAsync(agg, callback);
			else if(Meteor.isClient) return this._findClassAggregateResult(agg);
		}.bind(this);
	},
	
	
	_execClassAggregateSync: function(agg) {
		var exec = UltimateAggregateCollectionPublisher.prototype.exec;
		return exec(agg, this.collection()).result;
	},
	_execClassAggregateAsync: function(agg, callback) {
		Meteor.call('execAggregateAsync', agg, this.className, function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},
	_findClassAggregateResult: function(agg) {
		var selector = this._prepareClassFindSelector(agg),
			res =  UltimateAggregates.find(selector, {sort: {updated_at: -1}}).fetch(),
			latestAggValue = res.shift();
	
		this._removeClassStalePublishedAggregates(res);
	
		return res ? latestAggValue.result : 0;
	},
	
	
	_removeClassStalePublishedAggregates: function() {
		_.each(res, function(agg) {
			UltimateAggregates._collection.remove(agg._id); //remove old ones from browser localstorage
		});
	},
	_prepareClassFindSelector: function(selector) {
		selector.collection = this.collection()._name; //info for selecting later in UltimateAggregates collection
		return selector;
	}
});