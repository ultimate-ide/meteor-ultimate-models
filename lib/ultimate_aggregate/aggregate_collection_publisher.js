Ultimate('UltimateAggregateCollectionPublisher').extends(UltimateAggregatePublisher, {
	construct: function(publisher, aggregates, ModelClass) {
		this.callParentConstructor(publisher, aggregates, ModelClass);
		this.start();
	},
	store: function(result, agg) {
		var id = EJSON.stringify(agg),
			newAgg = UltimateClone.deepClone(agg);
			
		newAgg.result = result;	
		
		if(_.contains(this._publishedIds, id)) {
			this.publisher.changed('ultimate_aggregates', id, newAgg);
		}
		else {
			this._publishedIds.push(id);
			this.publisher.added('ultimate_aggregates', id, newAgg);
		}
	},
	cursor: function(agg) {
		var selector = agg.selector || {};
		return this.collection.find(selector, {limit: 1, sort: {updated_at: -1}});
	}
});