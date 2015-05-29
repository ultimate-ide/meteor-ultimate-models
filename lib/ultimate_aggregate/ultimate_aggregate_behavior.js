Ultimate('UltimateAggregateBehavior').extends(UltimateBehavior, {}, {	
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		this.modelClass = this.ownerClass();

		this._addAggregateMethods(this.ownerPrototype());
		this.createAggregateBasicClassMethods();

		this.ownerPrototype().on('methodsAdded', this._addAggregateMethods.bind(this));
	},

	_addAggregateMethods: function(methods) {
		this.createAggregateClassMethods(methods.aggregates);
		this.createAggregateMethods(methods.relations);
	},


	createAggregateClassMethods: function(aggregates) {
		_.each(aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateClassMethod(name, agg);
		}, this);
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
	_prepareBasicAggregate: function(operator, field, selector) {
		var agg = {};
		
		agg.operator = operator
		if(field && operator != 'count') agg.field = field; //count doesnt have a field
		if(selector) agg.selector = selector;
		
		return agg;
	},

	

	createAggregateMethods: function(relations) {
		_.each(relations, function(rel, name) {
			rel = UltimateUtilities.extractConfig(rel, this.ownerPrototype());
			if(rel.relation == 'belongs_to') return;

			if(rel.relation == 'aggregate') this._createStandaloneAggregateMethod(name, rel);

			_.each(rel.aggregates, function(name) {
				this._createAggregateMethod(name, rel);
			}, this);
		}, this);
	},
	_createAggregateMethod: function(name, rel) {
		console.log('AGGREGATE CREATE', name);

		this.modelClass.prototype[name] = function(callback) {	

			var Model = UltimateUtilities.classFrom(rel.model),
				agg = Model.prototype.aggregates[name],
				aggregate = UltimateUtilities.extractConfig(agg, Model),
				helper = new CreateAggregateInstanceMethodsHelper(this, aggregate, rel);

			return helper.exec(callback);
		};
	},
	_createStandaloneAggregateMethod: function(name, agg) {
		console.log('AGGREGATE CREATE', name);

		var Model = this.modelClass;

		Model.prototype[name] = function(callback) {	
			var aggregate = UltimateUtilities.extractConfig(agg, Model),
				helper = new CreateAggregateInstanceMethodsHelper(this, aggregate, aggregate);

			return helper.exec(callback);
		};
	},


	createAggregateBasicClassMethods: function() {
		['sum', 'avg', 'count', 'min', 'max'].forEach(this._createAggregateClassMethod.bind(this));
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