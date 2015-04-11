Ultimate.extend('UltimateRelationsBelongsPublisher').extends(UltimateRelationsHasBelongsPublisher, {
	prepareSelector: function() {
		this.selector._id = {$in: this._inputIds()};	
	},
	_inputIds: function() {
		return this.parent.cursor.fetchValues(this.fk);
	}
});