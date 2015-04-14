Ultimate('CreateClassMethodsHelper').extends(CreateMethodsHelper, {
	construct: function(modelClass, agg) {
		this.modelClassName = modelClass.className;
		this.collection = modelClass.collection();
		this.aggregate = agg;
	},
	
	
	execAggregateSync: function(agg) {	
		var exec = UltimateAggregateRelationsPublisher.prototype.exec,
			aggRows = exec(this._getExecSelector(agg), this.collection, this.getGroupForeignKey());
			
		if(!this.getClass()) return aggRows; //no related model found; return simple group by field array instead
		else return this._combineModelsAndAggregates(aggRows, this._group, this._groupByOptions);
	},
	execAggregateAsync: function(agg, callback) {
		var agg = this._prepareGroupByExecSelector(agg),
			fk = this.getGroupForeignKey(),
			groupClassName = this.getClassName(),
			options = this._groupByOptions;
		
		this.callParent('_execAggregateAsync', agg, callback, fk, groupClassName, options);
	},
	_findGroupByAggregateResult: function(agg, rel) {
		var selector = this._getFindSelector(agg, rel),
			aggRows = UltimateAggregates.find(selector, {sort: {updated_at: -1}});
			
		aggRows = this._removeStalePublishedAggregates(aggRows);
		
		if(!this.getClass()) return aggRows; //won't even work currently, but its consistent with exec and execAsync
		else return this._combineModelsAndAggregates(aggRows, this._group, this._groupByOptions);
	},

	
	_getExecSelector: function(agg) {
		_.extend(agg.selector, this._groupBySelector);
	},
	_getFindSelector: function(selector, rel) {
		this.aggregate = this.callParent('_getFindSelector');
		this.aggregate.model = this.getClassName();
		return this.aggregate;
	},
	getClassName: function() {
		return this.getClass(), this.getClass().className : null;
	},
	getClass: function() {
		return _.isString(this._group) ? this.getClassFromField() : this._group;
	},
	

	_removeStalePublishedAggregates: function(aggRows) {
		var usedIds = [],
			returnRows = [],
			staleRowIds = [];
	
		_.each(aggRows, function(row) {
			if(!_.contains(usedIds, row._fk)) {
				usedIds.push(row.fk);
				returnRows.push(row);
			}	
			else staleRows.push(row._id);
		});
	
		UltimateAggregates._collection.remove({_id: {$in: staleRowIds}}); //remove old ones from browser localstorage
		
		return returnRows;
	},
	_combineModelsAndAggregates: function(aggRows, groupModel, options) {
		var groupsObj = {}, 
			ids = aggRows.map(function(group) {
				groupsObj[group._id] = group.result;
				return group._id;
			});
			
		return groupModel.collection().find({_id: {$in: ids}}, options).map(function(model) {
			model.result = groupsObj[model._id].result;
			return model;
		});
	}
});