Ultimate.extend('UltimateRelationsBelongsPublisher').extends(UltimateRelationsHasBelongsPublisher, {
	prepareSelector: function() {
		this.selector._id = {$in: this._ids()};	
	},
	_ids: function() {
		return this.parent.getCursor().fetchValues(this.fk);
	}
});