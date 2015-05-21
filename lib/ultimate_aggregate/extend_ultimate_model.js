UltimateModel.extendStatic({
	agg: function(aggregates, selector) {
		var aggs = _.toArray(arguments);
		
		if(_.isObject(aggs[aggs.length - 1])) selector = aggs.pop();	
		this.attachAggregates(aggs, selector);	
		
		return this;
	},
	attachAggregates: function(aggregates, selector) {
		if(!_.isArray(aggregates)) return;	
		//selector within object needs to be made to work again. AggregatePublisher is not currently expecting it.
		//this._aggregates = this.getAggregates().concat({aggregates: aggregates, selector: selector});
		this._aggregates = this.getAggregates().concat(aggregates);
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

		return this;
	},


	sumAgg: function(field, selector, reactive) {
		return this._prepareBasicAggregate('sum', _.toArray(arguments));
	},
	avgAgg: function(field, selector, reactive) {
		return this.prepareBasicAggregate('avg', _.toArray(arguments));
	},
	minAgg: function(field, selector, reactive) {
		return this.prepareBasicAggregate('min', _.toArray(arguments));
	},
	maxAgg: function(field, selector, reactive) {
		return this.prepareBasicAggregate('max', _.toArray(arguments));
	},
	countAgg: function(field, selector, reactive) {
		return this.prepareBasicAggregate('count', _.toArray(arguments));
	},
	_prepareBasicAggregate: function(operator, fieldSelectorReactive) {
		var agg = {}; 
		
		agg.operator = 'sum';
		agg.field = fieldSelectorReactive.shift();
		agg.selector = fieldSelectorReactive.shift() || {};
		agg.reactive = fieldSelectorReactive.shift();
		
		this.attachAggregates([agg]);

		return this;
	}
});