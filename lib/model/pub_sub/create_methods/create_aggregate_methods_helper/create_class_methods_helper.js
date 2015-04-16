Ultimate('CreateAggregateClassMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelClass, agg) {
		this.modelClassName = modelClass.className;
		this.collection = modelClass.collection();
		this.aggregate = agg;
	},
	
	execAggregateSync: function() {
		return UltimateAggregateCollectionPublisher.prototype(this.aggregate, this.collection).result;
	},
	execAggregateAsync: function(callback) {
		this.callParent('_execAggregateAsync', this.aggregate, callback);
	}
});