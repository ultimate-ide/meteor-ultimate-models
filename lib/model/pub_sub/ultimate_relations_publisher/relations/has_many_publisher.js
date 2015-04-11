Ultimate.extend('UltimateRelationsHasPublisher').extends(UltimateRelationsHasBelongsPublisher, {
	prepareSelector: function() {
		this.selector[this.fk] = {$in: this._inputIds()};
	},
	_inputIds: function() {
		return this.parent.cursor.fetchIds();
	}
});