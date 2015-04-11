UltimateModel.extendStatic({
	sum: function(field, selector, reactive) {
		return this._prepareBasicAggregate('sum', _.toArray(arguments));
	},
	avg: function(field, selector, reactive) {
		return this.prepareBasicAggregate('avg', _.toArray(arguments));
	},
	min: function(field, selector, reactive) {
		return this.prepareBasicAggregate('min', _.toArray(arguments));
	},
	max: function(field, selector, reactive) {
		return this.prepareBasicAggregate('max', _.toArray(arguments));
	},
	count: function(field, selector, reactive) {
		return this.prepareBasicAggregate('count', _.toArray(arguments));
	},


	_prepareBasicAggregate: function(operator, fieldSelectorReactive) {
		var agg = {}; 
		
		agg.operator = 'sum';
		agg.field = fieldSelectorReactive.shift();
		agg.selector = fieldSelectorReactive.shift() || {};
		agg.reactive = fieldSelectorReactive.shift();
		
		this.agg(agg);
		
		return this;
	}
});