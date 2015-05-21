Ultimate('UltimateAggregate').extends(UltimateModel, {
	collection: 'ultimate_aggregates',

	onStartup: function() {
		if(Meteor.isServer) {
			Meteor.publish('ultimate_aggregates', function() {
				return UltimateAggregates.find();
			});
		}
		else Meteor.subscribe('ultimate_aggregates');
	}
});


Ultimate('UltimateRemoval').extends(UltimateModel, {
	collection: 'ultimate_removals',

	onStartup: function() {
		if(Meteor.isClient) return;
		this.setInterval(this.removeUltimateRemovals, 2 * 60 * 1000);
	},
	removeUltimateRemovals: function() {
		UltimateRemovals.remove({updated_at: {$lt: moment().subtract(2, 'minutes').toDate()}});
	}
});