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
		_.each(aggregates, this._createAggregateClassMethod.bind(this));
	},
	_createAggregateClassMethod: function(agg, name) {
		var self = this;

		this.modelClass[name] = function(field, selector, callback) {	
			var agg = UltimateUtilities.extractConfig(agg, self.ownerPrototype()),
				callback = _.callbackFromArguments(arguments);

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
			var relString = _.isFunction(rel) ? rel.toString() : EJSON.stringify(rel);
			if(/relation(.{1,5})belongs_to/.test(relString)) return; //matches relation: 'belongs_to'
			if(/relation(.{1,5})aggregate/.test(relString)) this._createStandaloneAggregateMethod(rel, name); //for aggregates defined as relations

			_.each(rel.aggregates, this._createAggregateMethod.bind(this, rel));
		}, this);
	},
	_createAggregateMethod: function(rel, name) {
		console.log('AGGREGATE CREATE', name);

		this.modelClass.prototype[name] = function(callback) {	
			var rel = UltimateUtilities.extractConfig(rel, this),
				Model = UltimateUtilities.classFrom(rel.model),
				aggregate = UltimateUtilities.extractConfig(Model.prototype.aggregates[name], Model),
				helper = new CreateAggregateInstanceMethodsHelper(this, aggregate, rel);

			return helper.exec(callback);
		};
	},
	_createStandaloneAggregateMethod: function(rel, name) {
		console.log('AGGREGATE CREATE', name);

		this.modelClass.prototype[name] = function(callback) {	
			var rel = UltimateUtilities.extractConfig(rel, this),
				Model = this.class,
				aggregate = UltimateUtilities.extractConfig(rel, Model),
				helper = new CreateAggregateInstanceMethodsHelper(this, aggregate, aggregate); //yes, the agg is the rel in this case

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