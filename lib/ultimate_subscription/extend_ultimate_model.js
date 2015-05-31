UltimateModel.extendStatic({
	subscribe: function(name, options, callbacks) {
		var sub = this.prototype.subscriptions[name];
		if(_.isFunction(sub)) sub = sub.call(this.prototype, Meteor.userId());
		else sub = UltimateClone.deepClone(sub); 

		options = _.extend({}, sub, options);
		options.selector = options.selector || {};

		this.with(UltimateClone.deepClone(sub.with));
		this.attachAggregates(UltimateClone.deepClone(sub.aggregates), UltimateClone.deepClone(sub.aggregates_selector));
		//relations and aggregates are now stored on model class; eg: User._relations and User._aggregates
		
		//getRelations() and getAggregates() returns merged rels/aggs on model class.
		//What's merged is rels/aggs from the subscription definition map + additional ones added at subscribe time
		
		var rels = this.getRelations(),
			aggs = this.getAggregates(),
			useCache = this._useCache,
			subsManger = this._subsManager,
			returnHandle = this._returnHandle,
			methodName = UltimateSubscriptionBehavior._methodName('subscribe', name); 
		
		this.clearClassSubscribeStorage();	
		
		if(returnHandle) return this._prephandle(options, rels, aggs, useCache, subsManger, callbacks, sub);
		else return this[methodName](options, rels, aggs, useCache, subsManger, callbacks);//eg: User.orders(opts, rels..)
	},
	_prephandle: function(options, rels, aggs, useCache, subsManger, callbacks, sub) {
			var handle = function(usedByDatatable, tableName, ids, fields) {
				if(usedByDatatable) options = this._prepareOptionsForDatatable(options, ids, fields);
				return this[methodName](options, rels, aggs, useCache, subsManger, callbacks);//eg: User.orders(opts, rels..)
			}.bind(this);
			
			//assign this to the function so UltimateDatatableComponent can access them without calling the function
			//the function is ultimately called by Tabular as its 'pub' property
			handle.model = this;
			handle.selector = _.extend({}, sub.selector, options.selector);

			return handle;
		},
	_prepareOptionsForDatatable: function(options, ids, fields) { 
		options.selector = _.extend({}, options.selector, {ids: {$in: ids}});
		options.fields = fields;
		return options;
	},
	clearClassSubscribeStorage: function() {
		this._relations = {}; //clear up for next calls to subscribe
		this._aggregates = [];
		this._useCache = this._subsManager = this._returnHandle = null;
	},


	keep: function(limit, expireIn) {
		this._subsManager = this._subsManager || new SubsManager({limit: limit, expireIn: expireIn});
		return this;
	},
	clear: function() {
		if(this._subsManager) this._subsManager.clear();
		return this;
	},
	reset: function() {
		if(this._subsManager) this._subsManager.reset();
		return this;
	},

	
	cache: function() {
		this._useCache = true;
		return this;
	},
	handle: function() {
		this._returnHandle = true;
		return this;
	}
});