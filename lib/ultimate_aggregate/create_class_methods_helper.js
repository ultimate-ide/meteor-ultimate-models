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
	},
	_getFindSelector: function() {
		this.aggregate = this.callParent('_getFindSelector');
		this.aggregate.type = 'collection'; 
		return this.aggregate;
	}
});