Ultimate('UltimateRelationsManyManyPublisher').extends(UltimateBaseRelationsPublisher, {
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
			model: _.isString(rel.model) ? Ultimate.classes[rel.model] : rel.model,
			foreign_key: rel.foreign_key[1],
			options: UltimateClone.deepClone(rel.options),
			aggregates: rel.aggregates
		};
		
		if(rel.resetRelationFunc) this.resetRelationFunc = rel.resetRelationFunc;
		
		
		if(!this.throughPublisher) 
			this.throughPublisher = new UltimateRelationsThroughPublisher(this.publisher, hasRelation);		
		else this.throughPublisher.setupRelation(hasRelation); //calling again if this.resetRelationFunc triggers it
		
		if(!this.belongsPublisher) 
			this.belongsPublisher = new UltimateRelationsBelongsPublisher(this.publisher, belongsRelation);		
		else this.belongsPublisher.setupRelation(belongsRelation); //calling again if this.resetRelationFunc triggers it


		this.modelClass = this.belongsPublisher.modelClass; //needed for children to link to this parent in urp_factory.js
	},
	
	collectionFromThrough: function(through) {
		through = Ultimate.classes[through] || through;
		
		if(_.isString(through)) return new Meteor.Collection(through);
		else if(through.isModel) return through.collection;
		else return through;
	},
	linkParent: function(parent) {	
		this.parent = parent;	
		parent.on('cursorChange', this.updatePublishers.bind(this), true);
		
		this.throughPublisher.linkParent(parent); 
		this.belongsPublisher.linkParent(this.throughPublisher);
		this.belongsPublisher.on('cursorChange', function() {
			this.emit('cursorChange');
		}.bind(this));
	},
	updatePublishers: function() {
		if(this.resetRelationFunc) this.resetRelationFunc();
	},
	getCursor: function() {
		return this.belongsPublisher.cursor;
	},
	getOldCursor: function() {
		return this.belongsPublisher.oldCursor;
	}
});