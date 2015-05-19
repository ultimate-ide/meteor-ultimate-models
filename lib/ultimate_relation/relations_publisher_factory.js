Ultimate('UltimateRelationsPublisherFactory').extends({
	construct: function(publisher) {
		this.publisher = publisher;
		this.userId = publisher.userId;
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
		console.log("RELS", rels);
		_.each(rels, this._handleRelation, this);		
	},
	_handleRelation: function(options, name) {
		//options will be at least: {instances: {}} or {with: {payments: {}}, instances: {}}
		if(name == 'with') return; 

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
		console.log('RELATION', name, parent.modelClass.className);

		if(_.isFunction(rel)) {
			var relFunc = rel;
			rel = relFunc.call(parent.modelClass.prototype, this.userId, parent.outputIds(), options);
			this._assignResetRelationFunction(rel, relFunc, parent, options);
		}
		else rel = UltimateClone.deepClone(rel);
		
		return _.extend(rel, options); //rel.with and options.with (and other option properties) will combine
	},
	_createRelationPublisher: function(rel, options) {
		rel.options = _.extend({}, rel.options, options); //extend options again, cuz different ones will be used as the rel.options prop
		if(options.throughOptions) rel.throughOptions = options.throughOptions;
			
		switch (rel.relation) {
		    case 'has_one': 			return new UltimateRelationsHasPublisher(this.publisher, rel);
		    case 'has_many': 			return new UltimateRelationsHasPublisher(this.publisher, rel);
		    case 'belongs_to': 			return new UltimateRelationsBelongsPublisher(this.publisher, rel);
		    case 'many_to_many': 		return new UltimateRelationsManyManyPublisher(this.publisher, rel);
		    case 'through': 			return new UltimateRelationsThroughPublisher(this.publisher, rel);
		}
	},
	_createAggregatePublisher: function(rel, parent) {
		var aggPub = new UltimateAggregateRelationsPublisher(this.publisher, rel.aggregates, rel.model, rel.agg_selector);
		aggPub.linkParent(parent, rel.foreign_key);
	},
	
	//the purpose of assigning this is function is since some relations are defined as functions, 
	//we need to re-run them to make sure we didn't miss anything dynamic the developer did
	//to change the options that the publisher needs to be aware of ;).
	_assignResetRelationFunction: function(rel, relFunc, parent, options) {
		rel.resetRelationFunc = function() {
			var rel = relFunc.call(parent.modelClass.prototype, this.publisher.userId, parent.outputIds(), options);
			rel.options = _.extend({}, rel.options, options);
			if(options.throughOptions) rel.throughOptions = options.throughOptions;
			console.log("resetRelationFunc");
			this.setupRelation(rel); //this function will be assigned to an UltimateRelationsPublisher object
		};
	}
	
});