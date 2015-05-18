Ultimate('CreateAggregateInstanceMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelInstance, agg, rel) {
		this.modelInstance = modelInstance;
		this.aggregate = agg;
		
		this.relation = rel;
		this.model = rel.model;
		this.modelClassName = rel.model.className
		this.collection = rel.model.collection;
	},
	execAggregateSync: function() {
		return UltimateAggregateRelationsPublisher.prototype.exec(this._getExecSelector(), this.collection, true).result;
	},
	execAggregateAsync: function(callback) {
		this.callParent('_execAggregateAsync', this._getExecSelector(), callback);
	},
	_getExecSelector: function(agg) {
		return _.extend({}, this.aggregate, {selector: {fk: this.modelInstance._id}});
	},
	_getFindSelector: function() {
		this.aggregate = this.callParent('_getFindSelector');
		this.aggregate.model = this.modelClassName;
		this.aggregate.fk = this.modelInstance._id;
		return this.aggregate;
	}
});