Ultimate('UltimateAggregateCollectionPublisher').extends(UltimateAggregatePublisher, {
	construct: function(publisher, aggregates, ModelClass) {
		this.callParentConstructor(publisher, aggregates, ModelClass);
		this.start();
	}
	exec: function(agg, collection) {
		var group = {};
		
		group._id = null;
		group.result = {};
		
		if(agg.operator == 'count') group.result['$sum'] = 1;
		else group.result['$'+agg.operator] = '$'+agg.field;
			
		var	pipeline = [{$group: group}]; 
		
		agg.selector = agg.selector || {};
		pipeline.unshift({$match: agg.selector});
		
		collection = collection || this.collection; //allow for collection arg for usage by generated methods
		
		return collection.aggregate(pipeline).result;
	},
	store: function(result, agg) {
		var newAgg = UltimateClone.deepClone(agg);
		newAgg.result = result;
		
		this.publisher.added('ultimate_aggregates', (new Mongo.ObjectID).toHexString(), newAgg);
	},
	
	
	cursor: function(agg) {
		var selector = agg.selector || {};
		return this.collection.find(selector, {limit: 1, sort: {updated_at: -1}});
	}
});