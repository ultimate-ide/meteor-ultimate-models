Ultimate('UltimateRelationsHasBelongsPublisher').extends(UltimateRelationsPublisher, {
	construct: function(publisher, rel) {
		this.publisher = publisher;
		this.setupRelation(rel);
	},
	setupRelation: function(rel) {
		rel = _.isArray(rel) ? this._convertRelationArray(rel) : rel;

		this.relation = rel;
		this.type = rel.relation;
		this.modelClass = UltimateUtilities.classFrom(rel.model);
		this.fk = rel.foreign_key;
		
		this.options = rel.options;
		this.selector = this.options.selector || {};
		this.options.sort = this.options.sort || {updated_at: -1};
		
		if(this.type == 'has_one') this.options.limit = 1;
		
		if(!this.options.limit && this.modelClass && this.modelClass.prototype.defaultLimit) 
			this.options.limit = this.modelClass.prototype.defaultLimit;

		this.aggregates = rel.aggregates;
		
		this.collection = rel.collection || this.modelClass.collection;
		this.options.transform = null;
	},
	linkParent: function(parent) {		
		this.parentPublisher = parent;		

		//aggregate relations dont do the normal observe + publish process, but rather just
		//act as a passthrough, and pass on the aggregate config object to UltimateAggregateRelationsPublisher
		console.log('RELATION TYPE!!!', this.type);
		if(this.type.indexOf('aggregate') === 0) return; 

    	parent.on('cursorChange', function() {
    		console.log('CURSOR CHANGE');
    		this.updateObserver();
    	}.bind(this), true);
	},
	updateObserver: function() {
		this.prepareSelector();
		this.callParent('updateObserver');
	},


	//relation subscriptions can be array like this as well eg: orders: ['has_many', Order, 'user_id']
	_convertRelationArray: function(rel) {
		var relation = {};
		
		relation.relation = rel.shift();
		relation.model = rel.shift();
		relation.foreign_key = rel.shift();
		
		if(relation.relation == 'many_to_many') relation.through = rel.shift();

		relation.options = rel.shift();
		relation.aggregates = rel.shift();
		
		return relation;
	}
});