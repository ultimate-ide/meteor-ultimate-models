Ultimate.extend('UltimateBaseRelationsPublisher').extends({
	inputIds: function() {
		return this.parent.getCursor().fetchIds();
	},
	outputIds: function() {
		return this.getCursor().fetchIds();
	}
});