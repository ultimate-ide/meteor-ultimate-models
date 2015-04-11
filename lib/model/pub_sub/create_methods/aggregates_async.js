Meteor.methods({
	execAggregateAsync: function(agg, modelName, fk) {
		var exec = UltimateAggregateRelationsPublisher.prototype.exec,
			collection = Ultimate.classes[modelName].collection();
			
		if(fk) {
			return exec(agg, collection, false, fk);
		}
		else return exec(agg, collection, true).result;
	}
});