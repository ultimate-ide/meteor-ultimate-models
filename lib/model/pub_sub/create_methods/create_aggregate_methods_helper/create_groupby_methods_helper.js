Ultimate('CreateAggregateGroupByMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelClass, agg, group, groupBySelector, groupByOptions) {
		this.modelClass = modelClass;
		this.modelClassName = modelClass.className;
		this.collection = modelClass.collection();
		this.aggregate = agg;
		
		this._group = group;
		this._selector = groupBySelector;
		this._options = groupByOptions;
	},
	exec: function(callback) {
		this.modelClass._group = this.modelClass._groupBySelector = this.modelClass._groupByOptions = null;
		return this.callParent('exec', callback);
	},
	
	
	execAggregateSync: function() {	
		var exec = UltimateAggregateRelationsPublisher.prototype.exec,
			aggRows = exec(this._getExecSelector(), this.collection, this.getGroupForeignKey());
			
		if(!this.getGroup()) return aggRows; //no related model found; return simple group by field array instead
		else return this._combineModelsAndAggregates(aggRows, this._group, this._groupByOptions);
	},
	execAggregateAsync: function(callback) {
		var selector = this._getExecSelector(),
			fk = this.getGroupForeignKey();
		
		this.callParent('execAggregateAsync', selector, callback, fk, this.getGroupClassName(), this._groupByOptions);
	},
	findAggregateResult: function() {
		var selector = this._getFindSelector(),
			aggRows = UltimateAggregates.find(selector, {sort: {updated_at: -1}});
			
		if(!this.getGroup()) return aggRows; //won't even work currently, but its consistent with exec and execAsync
		else return this._combineModelsAndAggregates(aggRows, this._group, this._groupByOptions);
	},

	
	_getExecSelector: function() {
		_.extend(this.aggregate.selector, this._groupBySelector);
		return this.aggregate;
	},
	_getFindSelector: function() {
		this.aggregate = this.callParent('_getFindSelector');
		this.aggregate.model = this.getGroupClassName();
		return this.aggregate;
	},
	getGroupClassNameame: function() {
		return this.getGroup(), this.getGroup().className : null;
	},
	getGroup: function() {
		return _.isString(this._group) ? this.getGroupClassFromField() : this._group;
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
	},
	
	
	getGroupForeignKey: function() {
		if(_.isString(this._group)) return this._group;
		
		var fk;
		
		_.some(this._group.prototype.relations, function(rel) {
			if(rel.model.className == this.modelClassName) return fk = rel.foreign_key;
		}, this);
		
		return fk;
	},
	getGroupClassFromField: function() {
		var field = this._group,
			thisClassName = this.modelClassName,
			returnClass;
		
		_.some(Ultimate.classes, function(Class) {
			return _.some(Class.prototype.relations, function(rel) {
				if(rel.model.className == thisClassName && rel.foreign_key == field) return returnClass = Class;
			});
		});
		
		return returnClass;
	}
});