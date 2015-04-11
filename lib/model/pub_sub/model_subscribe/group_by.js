UltimateModel.extendStatic({
	groupBy: function(groupModelOrField, options) {
		if(_.isString(groupModel)) this._groupField = groupModelOrField
		else this._groupModel = groupModelOrField;
		
		options = options || {};
		this._groupBySelector = options.selector || {};
		delete options.selector
		this._groupByOptions = options || {};
	},
	
	getGroupForeignKey: function() {
		if(this._groupField) return this._groupField;
		
		var fk;
		
		_.some(this._groupModel.prototype.relations, function(rel) {
			if(rel.model.className == this.className) return fk = rel.foreign_key;
		}, this);
		
		return fk;
	},
	getClasslNameFromField: function() {
		var field = this._groupField,
			thisClassName = this.className,
			className;
		
		_.some(Ultimate.classes, function(Class) {
			return _.some(Class.prototype.relations, function(rel) {
				if(rel.model.className == thisClassName && rel.foreign_key == field) return className = Class.className;
			});
		});
		
		return className;
	}
});