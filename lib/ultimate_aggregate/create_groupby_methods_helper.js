Ultimate('CreateAggregateGroupByMethodsHelper').extends(CreateAggregateMethodsHelper, {
	construct: function(modelClass, agg, group, groupBySelector, groupByOptions) {
		this.modelClass = modelClass;
		this.modelClassName = modelClass.className;
		this.collection = modelClass.collection;
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
		else return this._combineModelsAndAggregates(aggRows, this.getGroup(), this._groupByOptions);
	},
	execAggregateAsync: function(callback) {
		var selector = this._getExecSelector(),
			fk = this.getGroupForeignKey(),
			ModelClass = this.getGroup();
		
		var newCallback = function(docs) {
			if(_.isFunction(ModelClass)) { //it might be sometimes a string such as user_id if no Class for groupBy field
				docs = docs.map(function(doc) {
					delete docs._originalDoc;
					return new ModelClass(doc);
				});
			}
			
			callback(docs);
		};

		this.callParent('execAggregateAsync', selector, newCallback, fk, this.getGroupClassName(), this._groupByOptions);
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
	getGroupClassName: function() {
		return this.getGroup() ? this.getGroup().className : null;
	},
	getGroup: function() {
		return _.isString(this._group) ? this.getGroupClassFromField() : this._group;
	},
	

	_combineModelsAndAggregates: function(aggRows, groupModel, options) {
		var groupsObj = {}, 
			ids = aggRows.map(function(group) {
				groupsObj[group._id] = group.result;
				return group._id;
			}),
			options = UltimateUtilities.pickCollectionOptions(options),
			models = groupModel.collection.find({_id: {$in: ids}}, options);

		return models.map(function(model) {
			model.result = groupsObj[model._id];
			console.log('RES', model.result);
			return model;
		});
	},

	
	getGroupForeignKey: function() {
		if(_.isString(this._group)) return this._group;
		
		var className = this.modelClassName;
		
		//find the foreignkey of by relation model that links to this aggregate model 
		var rel = _.find(this._group.prototype.relations, function(rel) {
			rel = UltimateUtilities.extractConfig(rel, this._group); 
			return rel.model.className == className;
		}, this);

		rel = UltimateUtilities.extractConfig(rel, this._group.prototype); 

		return rel ? rel.foreign_key : null;
	},
	getGroupClassFromField: function() {
		var field = this._group,
			className = this.modelClassName;
		
		return _.find(Ultimate.classes, function(Class) {
			return _.find(Class.prototype.relations, function(rel) {
				rel = UltimateUtilities.extractConfig(rel, Class);
				return rel.model.className == className && rel.foreign_key == field;
			});
		});
	}
});