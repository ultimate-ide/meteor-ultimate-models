Ultimate('UltimateRemoval').extends(UltimateModel, 'ultimate_removals', {
	onStartup: function() {
		this.setInterval(this.removeUltimateRemovals, 2 * 60 * 1000);
	},
	removeUltimateRemovals: function() {
		UltimateRemovals.remove({updated_at: {$lt: moment().substract(2, 'minutes').toDate()}});
	}
});