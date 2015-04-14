Ultimate.extend('UltimateRelationsHasBelongsPublisher').extends(UltimateRelationsPublisher, {
	construct: function(publisher, rel, name) {
		this.publisher = publisher;
		this.relationName = name;
		this.setupRelation(rel);
	},
	setupRelation: function(rel) {
		rel = _.isArray(rel) ? this.convertRelationArray(rel) : rel;
		
		this.relation = rel;
		this.type = rel.relation;
		this.modelClass = Ultimate.classes[rel.model];
		this.fk = rel.foreign_key;
		
		this.options = rel.options;
		this.selector = this.options.selector || {};
		this.options.sort = this.options.sort || U.$updatedDesc;
		this.options.limit = this.options.limit || (this.modelClass ? (this.modelClass.prototype.defaultLimit || 10) : 10);
		
		this.aggregates = rel.aggregates;
		
		this.collection = rel.collection || rel.model.collection();
		this.options.transform = null;
	},
	_convertRelationArray: function(rel) {
		var relation = {};
		
		relation.relation = rel.shift();
		relation.model = rel.shift();
		relation.foreign_key = rel.shift();
		
		if(relation.relation == 'many_to_many') relation.through = rel.shift();

		relation.options = rel.shift();
		relation.aggregates = rel.shift();
		
		return relation;
	},
	
	linkParent: function(parent) {		
		this.parent = parent;		
    parent.on('cursorChange', this.updateObserver.bind(this), true);
	},
	updateObserver: function() {
		this.prepareSelector();
		this.callParent('updateObserver');
	}
});