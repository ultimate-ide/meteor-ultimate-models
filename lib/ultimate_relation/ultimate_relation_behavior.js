Ultimate('UltimateRelationBehavior').extends(UltimateBehavior, {}, {
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		var relations = this.owner().getPrototype().relations;

		_.each(relations, function(rel, name) {
			this._createRelationMethod(name, rel);
		}, this);
	},
	_createRelationMethod: function(name, rel) {
		var proto = this.ownerPrototype(),
			collection = rel.collection || rel.model.collection,
			findName = rel.relation == 'has_one' || rel.relation == 'belongs_to' ? 'findOne' : 'find';
			
		proto[name] = function(selector, options) { //create function, eg: user.orders();
			selector = _.extend({}, rel.options ? rel.options.selector : null, selector);
			options = _.extend({}, rel.options, options);
			
			if(rel.relation == 'belongs_to') selector._id = this[rel.foreign_key];
			else selector[rel.foreign_key] = this._id;

			if(options.limit == 1) findName = 'findOne';
			
			return collection[findName](selector, options);
		};
	}
});


