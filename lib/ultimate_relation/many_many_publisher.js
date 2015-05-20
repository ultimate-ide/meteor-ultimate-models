Ultimate('UltimateRelationsManyManyPublisher').extends(UltimateRelationsPublisher, {
	construct: function(publisher, rel) {
		this.publisher = publisher;
		this.setupRelation(rel);
	},
	setupRelation: function(rel) {
		var throughRelation = {
			collection: this.collectionFromThrough(rel.through), //collection instead of non-existent model
			foreign_key: rel.foreign_key[0],
			options: UltimateClone.deepClone(rel.throughOptions),
			relation: 'through'
		};
		
		var belongsRelation = {
			model: _.isString(rel.model) ? Ultimate.classes[rel.model] : rel.model,
			foreign_key: rel.foreign_key[1],
			options: UltimateClone.deepClone(rel.options),
			aggregates: rel.aggregates,
			relation: 'belongs_to'
		};		
		
		this.throughPublisher = new UltimateRelationsThroughPublisher(this.publisher, throughRelation);	
		this.belongsPublisher = new UltimateRelationsBelongsPublisher(this.publisher, belongsRelation);

		this.modelClass = this.belongsPublisher.modelClass; //needed for children to link to this parent in urp_factory.js
	},
	
	collectionFromThrough: function(through) {
		through = Ultimate.classes[through] || through;
		
		if(_.isString(through)) return new Meteor.Collection(through);
		else if(through.is('model')) return through.collection;
		else return through;
	},
	linkParent: function(parent) {	
		this.parentPublisher = parent;	

		this.throughPublisher.linkParent(parent); 
		this.belongsPublisher.linkParent(this.throughPublisher);

		this.belongsPublisher.on('cursorChange', function() {
			this.emit('cursorChange');
		}.bind(this));
	},
	getCursor: function() {
		return this.belongsPublisher.cursor;
	},
	getOldCursor: function() {
		return this.belongsPublisher.oldCursor;
	}
});