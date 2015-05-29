Ultimate('UltimateAggregateRelationsStandalonePublisher').extends(UltimateRelationsHasPublisher, {
	setupRelation: function(rel) {
		this.callParent('setupRelation', rel);

		//somewhat of a hack
		//the 'aggregate' relation type has the entire relation config obj set as a single aggregate
		this.aggregates = [this.relation]; 
	}
});
