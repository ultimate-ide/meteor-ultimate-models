UltimateModel.extendStatic({
	agg: function(aggregates, selector) {
		var aggs = _.toArray(arguments);
		
		if(_.isObject(aggs[aggs.length - 1])) {
			selector = aggs.pop();
		}
		
		this.attachAggregates(aggs, selector);	
		
		return this;
	},
	getAggregates: function() {
		return this._aggregates = this._aggregates || [];
	},
	
	
	attachAggregates: function(aggregates, selector) {
		if(!_.isArray(aggregates)) return;	
		this._aggregates = this.getAggregates().concat({aggregates: aggregates, selector: selector});
	},
});