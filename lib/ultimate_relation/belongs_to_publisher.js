Ultimate('UltimateRelationsBelongsPublisher').extends(UltimateRelationsHasBelongsPublisher, {
	prepareSelector: function() {
		this.selector._id = {$in: this._ids()};	
	},
	_ids: function() {
		return this.fetchValues(this.getParent().getCursor(), this.fk);
	}
});