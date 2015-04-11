UltimateModel.extendStatic({
	subscribe: function(name, options) {
		var sub = this.prototype.subscriptions[name],
			methodName = UltimatePubSub.prototype._methodName(name, 'subscribe');
		
		this.addRelationsObject(UltimateClone.deepClone(sub.with));
		this.attachAggregates(UltimateClone.deepClone(sub.aggregates), UltimateClone.deepClone(sub.aggregates_selector));
		
		this[methodName](options, this.getRelations(), this.getAggregates()); //eg: User.orders(opts, rels)
		
		this.clearClassStorage();
	},
	clearClassStorage: function() {
		this._relations = {}; //clear up for next calls to subscribe
		this._aggregates = [];
	}
});