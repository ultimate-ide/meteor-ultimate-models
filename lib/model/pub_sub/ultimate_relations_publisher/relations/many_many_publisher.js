Ultimate.extend('UltimateRelationsManyManyPublisher').extends({
	construct: function(publisher, rel) {
		this.publisher = publisher;
		this.setupRelation(rel);
	},
	setupRelation: function(rel) {
		var hasRelation = {
			collection: this.collectionFromThrough(rel.through), //collection instead of non-existent model
			foreign_key: rel.foreign_key[0],
			options: UltimateClone.deepClone(rel.throughOptions)
		};
		
		var belongsRelation = {
			model: Ultimate.classes[rel.model],
			foreign_key: rel.foreign_key[1],
			options: UltimateClone.deepClone(rel.options),
			aggregates: rel.aggregates
		};
		
		this.throughPublisher = new UltimateRelationsThroughPublisher(this.publisher, hasRelation);		
		this.belongsPublisher = new UltimateRelationsBelongsPublisher(this.publisher, belongsRelation);
		
		this.modelClass = this.belongsPublisher.modelClass; //needed for children to link to this parent in urp_factory.js
	},
	
	collectionFromThrough: function(through) {
		through = Ultimate.classes[through] || through;
		
		if(_.isString(through)) return new Meteor.Collection(through);
		else if(through.isModel) return through.collection;
		else return through;
	},
	linkParent: function(parent) {	
		this.throughPublisher.linkParent(parent); 
		this.belongsPublisher.linkParent(this.throughPublisher);
	}
});