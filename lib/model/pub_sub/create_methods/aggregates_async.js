Meteor.methods({
	execAggregateAsync: function(agg, modelName, fk, groupModelClassName, options) {
		var exec = UltimateAggregateRelationsPublisher.prototype.exec,
			collection = Ultimate.classes[modelName].collection(),
			groupModel = Ultimate.classes[groupModelClassName];
			
		if(fk) {
			var groupsObj = {}, 
				ids = exec(agg, collection, false, fk).map(function(group) {
					groupsObj[group._id] = group.result;
					return group._id;
				});
			
			return groupModel.collection().find({_id: {$in: ids}}, options).map(function(model) {
				model.result = groupsObj[model._id].result;
				return model;
			});
		}
		else return exec(agg, collection, true).result;
	}
});