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
			
			this._groupModel = this._groupField = this._groupBySelector = this._groupByOptions = null;
		}.bind(this);
	},
	
	
	_execGroupByAggregateSync: function(agg) {
		var agg = this._prepareGroupByExecSelector(agg),
			exec = UltimateAggregateRelationsPublisher.prototype.exec,
			fk = this.getGroupForeignKey();
			
		return this._combineModelsAndAggregates(agg, fk);
		
		return models;
	},
	_execGroupByAggregateAsync: function(agg, callback) {
		var agg = this._prepareGroupByExecSelector(agg),
			fk = this.getGroupForeignKey(),
			groupClassName = this._groupModel.className,
			options = this._groupByOptions;
		
		Meteor.call('execAggregateAsync', agg, this.className, fk, groupClassName, options function(err, res) {
			if(!err) callback(res);
			else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
		});
	},
	_findGroupByAggregateResult: function(agg, rel) {
		var selector = this._prepareGroupByFindSelector(agg, rel),
			aggRows = UltimateAggregates.find(selector, {sort: {updated_at: -1}});
			
		return this._combineModelsAndAggregates(null, null, aggRows);
	},

	
	_prepareGroupByExecSelector: function(agg) {
		_.extend(agg.selector, this._groupBySelector);
	},
	_prepareGroupByFindSelector: function(selector, rel) {
		selector.collection = this.collection()._name; //info for selecting later in UltimateAggregates collection
		selector.model = this._groupModel ? this._groupModel.className : this.getClasslNameFromField();
		return selector;
	},
	_combineModelsAndAggregates: function(agg, fk, aggRows) {
		var groupsObj = {}, 
			rows = aggRows || exec(agg, this.collection(), fk),
			ids = rows.map(function(group) {
				groupsObj[group._id] = group.result;
				return group._id;
			});
			
		return this._groupModel.collection().find({_id: {$in: ids}}, this._groupByOptions).map(function(model) {
			model.result = groupsObj[model._id].result;
			return model;
		});
	}
});