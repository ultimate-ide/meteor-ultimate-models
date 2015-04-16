Ultimate('CreateAggregateMethods').extends({	
	construct: function(modelClass) {
		this.modelClass = modelClass;
	}
	createAggregateClassMethods: function() {
		_.each(this.modelClass.prototype.aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateClassMethod(name, agg);
		}, this);
	},
	createAggregateMethods: function() {
		_.each(this.modelClass.prototype.relations, function(rel) {
			_.each(rel.aggregates, function(name) {
				var agg = UltimateClone.deepClone(rel.model.prototype.aggregates[name]);
				this._createAggregateMethod(name, agg, rel);
			}, this);
		}, this);
	},
	createAggregateBasicClassMethods: function() {
		['sum', 'avg', 'count', 'min', 'max'].forEach(this._createAggregateClassMethod.bind(this));
	},
	
	
	_createAggregateClassMethod: function(name, agg) {
		this.modelClass[name] = function(field, selector, callback) {		
			agg = _.isString(field) ? this._prepareBasicAggregate(name, field, selector) : agg;
			
			if(!this._group) var helper = new CreateAggregateClassMethodsHelper(this, agg);
			else var helper = new CreateAggregateGroupByMethodsHelper(this, agg, this._group, this._groupBySelector, this._groupByOptions);
			
			var callback = _.callbackFromArguments(arguments);
			return helper.exec(callback);
		};
	},
	_createAggregateMethod: function(name, agg, rel) {
		this.modelClass.prototype[name] = function(callback) {			
			var helper = new CreateAggregateInstanceMethodsHelper(this, agg, rel);
			return helper.exec(callback);
		};
	},
	
	
	_prepareBasicAggregate: function(operator, field, selector) {
		var agg = {};
		
		agg.field = field;
		agg.selector = selector;
		agg.operator = operator
		
		return agg;
	}
});