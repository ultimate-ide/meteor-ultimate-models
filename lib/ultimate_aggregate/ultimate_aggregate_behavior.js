Ultimate('UltimateAggregateBehavior').extends(UltimateBehavior, {}, {	
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		this.modelClass = this.ownerClass();
		var aggregates = this.ownerPrototype().aggregates,
			relations = this.ownerPrototype().relations;

		this.createAggregateClassMethods(aggregates);
		this.createAggregateMethods(relations);
		this.createAggregateBasicClassMethods();

		this.ownerPrototype().on('methodsAdded', function(methods) {
			this.createAggregateClassMethods(methods.aggregates);
			this.createAggregateMethods(methods.relations);
		}.bind(this));
	},


	createAggregateClassMethods: function(aggregates) {
		_.each(aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateClassMethod(name, agg);
		}, this);
	},
	createAggregateMethods: function(relations) {
		_.each(relations, function(rel) {
			_.each(rel.aggregates, function(name) {
				var agg = rel.model.prototype.aggregates[name];
				agg = UltimateClone.deepClone(agg);

				this._createAggregateMethod(name, agg, rel);
			}, this);
		}, this);
	},
	createAggregateBasicClassMethods: function() {
		['sum', 'avg', 'count', 'min', 'max'].forEach(this._createAggregateClassMethod.bind(this));
	},
	
	
	_createAggregateClassMethod: function(name, agg) {
		var self = this;

		this.modelClass[name] = function(field, selector, callback) {	
			var callback = _.callbackFromArguments(arguments);

			if(_.isFunction(field)) field = null; //callback was in field arg's spot	
			if(_.isFunction(selector)) selector = null; //callback was in selector arg's spot

			if(_.isString(field) || name == 'count') agg = self._prepareBasicAggregate(name, field, selector);
			
			if(!this._group) var helper = new CreateAggregateClassMethodsHelper(this, agg);
			else var helper = new CreateAggregateGroupByMethodsHelper(this, agg, this._group, this._groupBySelector, this._groupByOptions);
			
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
		
		agg.operator = operator
		agg.field = field;
		agg.selector = selector;
		
		return agg;
	}
});


if(Meteor.isServer) {
	Meteor.methods({
		execAggregateAsync: function(agg, modelName, fk, groupModelClassName, options) {
			var collection = Ultimate.classes[modelName].collection;
				
			if(fk) {
				var aggRows = UltimateAggregatePublisher.prototype.exec(agg, collection, fk),
					groupModel = Ultimate.classes[groupModelClassName];
					
				if(!groupModel) return aggRows;
				else return CreateAggregateGroupByMethodsHelper.prototype._combineModelsAndAggregates(aggRows, groupModel, options);
			}
			else return UltimateAggregatePublisher.prototype.exec(agg, collection);
		}
	});
}