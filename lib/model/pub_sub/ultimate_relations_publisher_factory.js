Ultimate.extend('UltimateRelationsPublisherFactory').extends({
	construct: function(publisher) {
		this.publisher = publisher;
	},
	startPublishing: function(relations, ModelClass, selector, options) {
		this.createParentPublisher(ModelClass, selector, options);
		this.createRelationsPublishers(relations);
	},
	createParentPublisher: function(ModelClass, selector, options) {
		var rp = new UltimateRelationsParentPublisher(this.publisher, ModelClass, selector, options);
		this.relationPublishers = [rp];
	},
	
	
	createRelationsPublishers: function(rels) {
		_.each(rels, function(options, name) {
			this._handleRelation(name, options);
			if(rel.with) this.createRelationsPublishers(options.with);
		}, this);		
	},
	_handleRelation: function(name, options) {
		var parent =  this._lastRp(),
			rel = this._relationFromName(name, parent),
			rp = this._createRelationPublisher(rel, options, name);

		rp.linkParent(parent);
		this.relationPublishers.push(rp);
		
		if(rel.aggregates) this._createAggregatePublisher(rel, parent);
	},
	
	
	_lastRp: function() {
		return this.relationPublishers[this.relationPublishers.length - 1];
	},
	_relationFromName: function(name, parent) {
		var rel = parent.modelClass.prototype.relations[name];
		return UltimateClone.deepClone(rel);
	},
	_createRelationPublisher: function(rel, options, name) {
		rel.options = _.extend({}, rel.options, options);
		if(options.throughOptions) rel.throughOptions = options.throughOptions;
			
		switch (rel.relation) {
	    case 'has_one': 			return new UltimateRelationsHasPublisher(this.publisher, rel, name);
	    case 'has_many': 			return new UltimateRelationsHasPublisher(this.publisher, rel, name);
	    case 'belongs_to': 		return new UltimateRelationsBelongsPublisher(this.publisher, rel, name);
	    case 'many_to_many': 	return new UltimateRelationsManyManyPublisher(this.publisher, rel, name);
	    case 'through': 			return new UltimateRelationsThroughPublisher(this.publisher, rel, name);
		}
	}
	_createAggregatePublisher: function(rel, parent) {
		var aggPub = new UltimateAggregateRelationsPublisher(this.publisher, rel.aggregates, rel.model, rel.agg_selector);
		aggPub.linkParent(parent, rel.foreign_key);
	}
});