Ultimate('UltimateRelationBehavior').extends(UltimateBehavior, {}, {
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		this._addRelationMethods(this.ownerPrototype());
		this.ownerPrototype().on('methodsAdded', this._addRelationMethods.bind(this));
	},
	_addRelationMethods: function(methods) {
		_.each(methods.relations, this._createRelationMethod.bind(this));
	},
	_createRelationMethod: function(rel, name) {
		console.log('REL BEHAVIOR', name, this.ownerPrototype().className);
		var proto = this.ownerPrototype();

		rel = UltimateUtilities.extractConfig(rel, proto); 

		var findName = rel.relation == 'has_one' || rel.relation == 'belongs_to' ? 'findOne' : 'find';
			
		proto[name] = function(selector, options) { //create function, eg: user.orders();
			selector = _.extend({}, rel.options ? rel.options.selector : null, selector);
			options = _.extend({}, rel.options, options);
			
			var model = _.isString(rel.model) ? Ultimate.classes[rel.model] : rel.model,
				collection = rel.collection || model.collection;

			if(rel.relation == 'belongs_to') selector._id = this[rel.foreign_key];
			else selector[rel.foreign_key] = this._id;

			if(options.limit == 1) findName = 'findOne';
			
			return collection[findName](selector, options);
		};
	}
});


