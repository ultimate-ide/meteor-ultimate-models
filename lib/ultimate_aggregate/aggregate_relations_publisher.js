Ultimate('UltimateAggregateRelationsPublisher').extends(UltimateAggregatePublisher, {
	construct: function(publisher, aggregates, ModelClass, selector) {
		this.selector = selector;
		this.callParentConstructor(publisher, aggregates, ModelClass)
	},
	linkParent: function(parent, fk) {		
		this.parentPublisher = parent;		
		this.fk = fk
		this.groupModelClassName = parent.modelClass.className;
		parent.on('cursorChange', this.start.bind(this), true);
	},
	exec: function(agg, collection, returnOneResult, fk) {
		var group = {};
		
		group._id = returnOneResult ? null : '$'+(fk || this.fk); //returnOneResult and fk used by generated methods
		group.result = {};
		
		if(agg.operator == 'count') group.result['$sum'] = 1;
		else group.result['$'+agg.operator] = '$'+agg.field;
			
		var	pipeline = [{$group: group}]; 
		
		pipeline.unshift({$match: agg.selector});
		
		collection = collection || this.collection; //allow for collection arg for usage in in create_methods.js
		
		return collection.aggregate(pipeline);
	},
	store: function(results, agg) {
		_.each(results, function(res) {
			var newAgg = UltimateClone.deepClone(agg);
			newAgg.result = res.result;
			newAgg.fk = res._id;
			newAgg.model = this.groupModelClassName;

			if(_.contains(this._publishedIds, newAgg.fk)) {
				this.publisher.changed('ultimate_aggregates', newAgg.fk, newAgg);
			}
			else {
				this._publishedIds.push(newAgg.fk);
				this.publisher.added('ultimate_aggregates', newAgg.fk, newAgg);
			}
		});
	},
	
	
	cursor: function(agg) {
		var selector = this.prepareSelector(agg.selector);
		return this.collection.find(selector, {limit: 1, sort: {updated_at: -1}});
	},
	
	
	_getAggregate: function(name) {
		var agg = this.callParent('_getAggregate', name);
		this._prepareSelector(agg.selector);
		return agg;
	},
	_prepareSelector: function(selector) {
		selector = selector || {};
		selector[this.fk] = {$in: this._ids()};
		return selector;
	},
	getParent: function() {
		return this.parentPublisher;
	},
	_ids: function() {
		return this.getParent().cursor.map(function(model) {
			return model._id;
		});
	}
});