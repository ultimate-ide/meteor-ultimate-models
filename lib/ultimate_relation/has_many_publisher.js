Ultimate('UltimateRelationsHasPublisher').extends(UltimateRelationsHasBelongsPublisher, {
	prepareSelector: function() {
		this.selector[this.fk] = {$in: this._ids()};
	},
	_ids: function() {
		return this.getParent().outputIds();
	}
});
