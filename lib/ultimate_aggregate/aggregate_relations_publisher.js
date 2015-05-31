Ultimate('UltimateAggregateRelationsPublisher').extends(UltimateAggregatePublisher, {
	construct: function(publisher, aggregates, ModelClass, selector, cachedIdsByCollection) {
		this.selector = selector;
		this.cachedIdsByCollection = cachedIdsByCollection;
		this.callParentConstructor(publisher, aggregates, ModelClass)
	},
	linkParent: function(parent, fk) {		
		this.parentPublisher = parent;		
		this.fk = fk;
		this.groupModelClassName = parent.modelClass.className;
		parent.on('cursorChange', this.start.bind(this), true);
	},
	store: function(results, agg) {
		_.each(results, function(res) {
			var newAgg = UltimateClone.deepClone(agg);

			newAgg.result = res.result;
			newAgg.fk = res._id;

			if(_.contains(this._publishedIds, newAgg.fk)) {
				this.publisher.changed('ultimate_aggregates', newAgg.fk, newAgg);
			}
			else {
				this._publishedIds.push(newAgg.fk);
				this.publisher.added('ultimate_aggregates', newAgg.fk, newAgg);

				
				this.publisher.added('ultimate_aggregates', newAgg.fk, newAgg); //normal response -- client doesn't have models from cache already

				//send 'changed' message as well since 'added' message will non-fatally fail client side
				if(_.contains(this.cachedIdsByCollection.ultimate_aggregates, newAgg.fk)) this.publisher.changed('ultimate_aggregates', newAgg.fk, newAgg);
			}
		}, this);
	},
	prepareUltimateAggregatePropsForSave: function(agg) {
		agg = UltimateClone.deepClone(agg);

		agg.model = this.groupModelClassName;
		agg.type = 'groupby';

		return agg;
	},
	cursor: function(agg) {
		var selector = this._prepareSelector(agg.selector);
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