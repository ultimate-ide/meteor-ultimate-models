Ultimate('UltimateRelationsPublisherFactory').extends({
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
		_.each(rels, this._handleRelation, this);		
	},
	_handleRelation: function(options, name) {
		var parent =  this._lastRp(),
			rel = this._relationFromName(name, parent, options),
			rp = this._createRelationPublisher(rel, options);

		rp.linkParent(parent);
		this.relationPublishers.push(rp);
		
		if(rel.aggregates) this._createAggregatePublisher(rel, parent);
		if(rel.with) this.createRelationsPublishers(rel.with);
		return rel;
	},
	
	
	_lastRp: function() {
		return this.relationPublishers[this.relationPublishers.length - 1];
	},
	_relationFromName: function(name, parent, options) {
		var rel = parent.modelClass.prototype.relations[name];
		if(_.isFunction(rel)) {
			var relFunc = rel;
			rel = relFunc.call(parent.modelClass.prototype, this.publisher, parent.outputIds(), options);
			this._assignResetRelationFunction(rel, relFunc, parent, options);
		}
		else rel = UltimateClone.deepClone(rel);
		
		return _.extend(rel, options); //rel.with and options.with (and other option properties) will combine
	},
	_createRelationPublisher: function(rel, options) {
		rel.options = _.extend({}, rel.options, options);
		if(options.throughOptions) rel.throughOptions = options.throughOptions;
			
		switch (rel.relation) {
	    case 'has_one': 			return new UltimateRelationsHasPublisher(this.publisher, rel);
	    case 'has_many': 			return new UltimateRelationsHasPublisher(this.publisher, rel);
	    case 'belongs_to': 		return new UltimateRelationsBelongsPublisher(this.publisher, rel);
	    case 'many_to_many': 	return new UltimateRelationsManyManyPublisher(this.publisher, rel);
	    case 'through': 			return new UltimateRelationsThroughPublisher(this.publisher, rel);
		}
	},
	_createAggregatePublisher: function(rel, parent) {
		var aggPub = new UltimateAggregateRelationsPublisher(this.publisher, rel.aggregates, rel.model, rel.agg_selector);
		aggPub.linkParent(parent, rel.foreign_key);
	},
	_assignResetRelationFunction: function(uarp, relFunc, parent, options) {
		uarp.resetRelationFunc = function() {
			var rel = relFunc.call(parent.modelClass.prototype, this.publisher, parent.outputIds(), options);
			rel.options = _.extend({}, rel.options, options);
			if(options.throughOptions) rel.throughOptions = options.throughOptions;
			this.setupRelation(rel);
		};
	}
});