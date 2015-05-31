Ultimate('CreateAggregateInstanceMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelInstance, agg, rel) {
		this.modelInstance = modelInstance;
		this.fk = modelInstance._id;
		this.aggregate = agg;
		
		this.relation = rel;
		this.model = UltimateUtilities.classFrom(rel.model);
		this.modelClassName = this.model.className;
		this.collection = this.model.collection;

		this.foreign_key = rel.foreign_key
	},
	execAggregateSync: function() {
		return UltimateAggregatePublisher.prototype.exec(this._getExecSelector(), this.collection, this.foreign_key);
	},
	execAggregateAsync: function(callback) {
		this.callParent('_execAggregateAsync', this._getExecSelector(), callback, this.foreign_key);
	},
	_getExecSelector: function() {
		var selector = {};
		selector[this.foreign_key] = this.fk;
		
		return _.extend({}, this.aggregate, {selector: selector});
	},
	_getFindSelector: function() {
		this.aggregate = this.callParent('_getFindSelector');
		this.aggregate.model = this.modelInstance.className; //this.modelClassName;
		this.aggregate.fk = this.fk;
		this.aggregate.type = 'groupby';

		return this.aggregate;
	}
});