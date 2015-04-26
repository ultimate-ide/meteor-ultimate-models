Ultimate.extend('UltimateRelationsThroughPublisher').extends(UltimateRelationsHasPublisher, {
	setupRelation: function(rel) {
		this.callParent('setupRelation', rel);
		this.through = true;
	}
});