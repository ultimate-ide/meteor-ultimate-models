UltimateModel.extendStatic({
	subscribe: function(name, options, callbacks) {
		var sub = this.prototype.subscriptions[name],
			methodName = UltimatePubSub.prototype._methodName(name, 'subscribe');
		
		this.addRelationsObject(UltimateClone.deepClone(sub.with));
		this.attachAggregates(UltimateClone.deepClone(sub.aggregates), UltimateClone.deepClone(sub.aggregates_selector));
		//relations and aggregates are now stored on model class; eg: User._relations and User._aggregates
		
		//getRelations() and getAggregates() returns merged rels/aggs on model class.
		//What's merged is rels/aggs from the subscription definition map + additional ones added at subscribe time
		this[methodName](options, this.getRelations(), this.getAggregates(), callbacks); //eg: User.orders(opts, rels)
		
		this.clearClassStorage();
	},
	clearClassStorage: function() {
		this._relations = {}; //clear up for next calls to subscribe
		this._aggregates = [];
	}
});