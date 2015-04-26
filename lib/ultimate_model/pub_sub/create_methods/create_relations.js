UltimateModel.extend({
	createRelationMethods: function() {
		_.each(this.___proto.relations, function(rel, name) {
			this._createRelationMethod(name, rel);
		}, this);
	},
	_createRelationMethod: function(name, rel) {
		var self = this,
			findName = rel.relation == 'has_one' || rel.relation == 'belongs_to' ? 'findOne' : 'find';
			
		this.___proto[name] = function(selector, options) { //create function, eg: user.orders();
			selector = _.extend({}, rel.options ? rel.options.selector : null, selector);
			options = _.extend({}, rel.options, options);
			
			if(options.limit == 1) findName = 'findOne';
			
			return self.collection[findName](selector, options);
		};
	}
});