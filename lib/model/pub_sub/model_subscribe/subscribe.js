UltimateModel.extendStatic({
	subscribe: function(name, options, callbacks) {
		var sub = this.prototype.subscriptions[name];
		
		sub = _.isFunction(sub) ? sub.call(this.prototype, Meteor.userId()) : sub;
		 
		this.addRelationsArray(UltimateClone.deepClone(sub.with));
		this.attachAggregates(UltimateClone.deepClone(sub.aggregates), UltimateClone.deepClone(sub.aggregates_selector));
		//relations and aggregates are now stored on model class; eg: User._relations and User._aggregates
		
		//getRelations() and getAggregates() returns merged rels/aggs on model class.
		//What's merged is rels/aggs from the subscription definition map + additional ones added at subscribe time
		
		var rels = this.getRelations(),
			aggs = this.getAggregates(),
			useCache = this._useCache,
			subsManger = this._subsManager,
			returnHandle = this._returnHandle,
			methodName = UltimatePubSub.prototype._methodName(name, 'subscribe'); 
		
		this.clearClassSubscribeStorage();
		
		var handle = function(usedByDatatable, tableName, ids, fields) {
			if(usedByDatatable) options = this._prepareOptionsForDatatable(options, ids, fields);
			return this[methodName](options, rels, aggs, useCache, subsManger, callbacks);//eg: User.orders(opts, rels..)
		}.bind(this);
		
		handle.model = this;
		handle.selector = _.extend({}, sub.selector, options.selector);
		
		return returnHandle ? handle : handle();
	},
	_prepareOptionsForDatatable: function(options, ids, fields) { 
		options = options || {},
		options.selector = options.selector || {};
		
		options.selector = _.extend({}, options.selector, {ids: {$in: ids}});
		options.fields = fields;
		return options;
	},
	clearClassSubscribeStorage: function() {
		this._relations = {}; //clear up for next calls to subscribe
		this._aggregates = [];
		this._useCache = this._subsManager = this._returnHandle = null;
	}
});