UltimateModel.extend({	
	createAggregateGroupByClassMethods: function() {
		_.each(this.___proto.aggregates, function(agg, name) {
			agg = UltimateClone.deepClone(agg);
			this._createAggregateGroupByClassMethod(name, agg);
		}, this);
	},
	_createAggregateGroupByClassMethod: function(name, agg) {
		this.class[name] = function(callback) {				
			if(Meteor.isServer) return this._execGroupByAggregateSync(agg);
			else if(Meteor.isClient && callback) this._execGroupByAggregateAsync(agg, callback);
			else if(Meteor.isClient) return this._findGroupByAggregateResult(agg, result);
			
			this._groupModel = this._groupField = this._groupBySelector = null;
		}.bind(this);
	},
	
	
	_execGroupByAggregateSync: function(agg) {
		var agg = this._prepareExecSelector(agg),
			exec = UltimateAggregateRelationsPublisher.prototype.exec,
			fk = this.getGroupForeignKey();
			
		return this._combineModelsAndAggregates(agg, fk);
		
		return models;
	},
	_execGroupByAggregateAsync: function(agg, callback) {
		var fk = this.getGroupForeignKey();
		
		Meteor.call('execAggregateAsync', agg, this.className, fk, function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},
	_findGroupByAggregateResult: function(agg, rel) {
		var selector = this._prepareGroupByFindSelector(agg, rel);
		
		return UltimateAggregates.find(selector, {sort: {updated_at: -1}});
	},


	_prepareGroupByFindSelector: function(selector, rel) {
		selector.collection = this.collection()._name; //info for selecting later in UltimateAggregates collection
		selector.model = this._groupModel ? this._groupModel.className : this.getClasslNameFromField();
		return selector;
	},
	_combineModelsAndAggregates: function(agg, fk) {
		var groupsObj = {}, 
			ids = exec(agg, this.collection(), fk).map(function(group) {
				groupsObj[group._id] = group.result;
				return group._id;
			});
			
		return this._groupModel.collection().find({_id: {$in: ids}}).map(function(model) {
			model.result = groupsObj[model._id].result;
			return model;
		});
	}
});