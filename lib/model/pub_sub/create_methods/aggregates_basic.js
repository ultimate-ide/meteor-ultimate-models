UltimateModel.extend({
	createAggregateBasicClassMethods: function() {
		['sum', 'avg', 'count', 'min', 'max'].forEach(this._createAggregateClassMethod.bind(this));
	},
	_prepareBasicAggregate: function(operator, field, selector) {
		var agg = {};
		
		agg.field = field;
		agg.selector = selector;
		agg.operator = operator
		
		return agg;
	}
});