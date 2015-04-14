Meteor.methods({
	execAggregateAsync: function(agg, modelName, fk, groupModelClassName, options) {
		var exec = UltimateAggregateRelationsPublisher.prototype.exec,
			collection = Ultimate.classes[modelName].collection();
			
		
		if(fk) {
			var aggRows = exec(agg, collection, false, fk),
				groupModel = Ultimate.classes[groupModelClassName];
				
			if(!groupModel) return aggRows;
			else return UltimateModel.prototype._combineModelsAndAggregates(aggRows, groupModel, options);
		}
		else return exec(agg, collection, true).result;
	}
});