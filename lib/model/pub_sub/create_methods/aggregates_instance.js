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
			if(Meteor.isServer) return this._execAggregateSync(agg, rel);
			else if(Meteor.isClient && callback) this._execAggregateAsync(agg, rel, callback);
			else if(Meteor.isClient) return this._findAggregateResult(agg, rel);
		}.bind(this);
	},
	
	
	_execAggregateSync: function(agg, rel) {
		var agg = this._prepareExecSelector(agg),
			exec = UltimateAggregateRelationsPublisher.prototype.exec;
			
		return exec(agg, rel.model.collection()).result;
	},
	_execAggregateAsync: function(agg, rel, callback) {
		var agg = this._prepareExecSelector(agg);
		
		Meteor.call('execAggregateAsync', agg, rel.model.className, function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},
	_findAggregateResult: function(agg, rel) {
		var selector = this._prepareFindSelector(agg, rel),
			res =  UltimateAggregates.find(selector, {sort: {updated_at: -1}}).fetch(),
			latestAggValue = res.shift();
	
		this._removeStalePublishedAggregates(res);
	
		return res ? latestAggValue.result : 0;
	},
	
	_prepareExecSelector: function(agg) {
		return _.extend({}, agg, {selector: {fk: this._id}})
	},
	_removeStalePublishedAggregates: function() {
		_.each(res, function(agg) {
			UltimateAggregates._collection.remove(agg._id); //remove old ones from browser localstorage
		});
	},
	_prepareFindSelector: function(selector, rel) {
		selector.collection = rel.model.collection()._name; //info for selecting later in UltimateAggregates collection
		selector.model = this.className;
		selector.fk = this._id;
		return selector;
	}
});