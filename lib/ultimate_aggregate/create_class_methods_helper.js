Ultimate('CreateAggregateClassMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelClass, agg) {
		this.modelClassName = modelClass.className;
		this.collection = modelClass.collection;
		this.aggregate = agg;
	},
	execAggregateSync: function() {
		return UltimateAggregatePublisher.prototype.exec(this.aggregate, this.collection);
	},
	execAggregateAsync: function(callback) {
		this.callParent('execAggregateAsync', this.aggregate, callback);
	}
});