UltimateModel.extendStatic({
	groupBy: function(groupModelOrField, options) {
		this._group = groupModelOrField;
		
		options = options || {};
		this._groupBySelector = options.selector || {};
		
		delete options.selector;
		this._groupByOptions = options || {};
	},
	
	getGroupForeignKey: function() {
		if(_.isString(this._group)) return this._group;
		
		var fk;
		
		_.some(this._group.prototype.relations, function(rel) {
			if(rel.model.className == this.className) return fk = rel.foreign_key;
		}, this);
		
		return fk;
	},
	getClassFromField: function() {
		var field = this._groupField,
			thisClassName = this.className,
			returnClass;
		
		_.some(Ultimate.classes, function(Class) {
			return _.some(Class.prototype.relations, function(rel) {
				if(rel.model.className == thisClassName && rel.foreign_key == field) return returnClass = Class;
			});
		});
		
		return returnClass;
	}
});