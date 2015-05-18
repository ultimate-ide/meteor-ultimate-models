UltimateModel.extendStatic({
	agg: function(aggregates, selector) {
		var aggs = _.toArray(arguments);
		
		if(_.isObject(aggs[aggs.length - 1])) selector = aggs.pop();	
		this.attachAggregates(aggs, selector);	
		
		return this;
	},
	attachAggregates: function(aggregates, selector) {
		if(!_.isArray(aggregates)) return;	
		this._aggregates = this.getAggregates().concat({aggregates: aggregates, selector: selector});
	},
	getAggregates: function() {
		return this._aggregates = this._aggregates || [];
	},



	groupBy: function(groupModelOrField, options) {
		this._group = groupModelOrField;
		
		options = options || {};
		this._groupBySelector = options.selector || {};
		
		delete options.selector;
		this._groupByOptions = options || {};
	},


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