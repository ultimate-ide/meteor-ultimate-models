UltimateModel.extendStatic({
	subscribe: function(name, options, callbacks) {
		var originalRelations = this.getRelations(),
			originalAggregates = this.getAggregates(),
			useCache = this._useCache,
			subsManger = this._subsManager,
			returnHandle = this._returnHandle,
			methodName = UltimateSubscriptionBehavior._methodName('subscribe', name),
			handle = this._prephandle(name, options, methodName, useCache, subsManger, originalRelations, originalAggregates, callbacks),
			ret = returnHandle ? handle : handle();

		this.clearClassSubscribeStorage();
		return ret;

	},
	_prephandle: function(name, options, methodName, useCache, subsManger, originalRelations, originalAggregates, callbacks) {
			var handle = function(datatableSubOrComputation, tableName, ids, fields) {
				this._relations = originalRelations;
				this._aggregates = originalAggregates;

				var options = this._prepSubConfig(name, options),
				rels = this.getRelations(), //getRelations() and getAggregates() returns merged rels/aggs on model class.
				aggs = this.getAggregates(); //What's merged is rels/aggs from the subscription definition map + additional ones added at subscribe time
		
				this.clearClassSubscribeStorage();

				//assign this to the function so UltimateDatatableComponent can access them without calling the function
				//the function is ultimately called by Tabular as its 'pub' property
				handle.model = this;
				handle.selector = _.extend({}, options.selector);

				if(tableName) options = this._prepareOptionsForDatatable(options, ids, fields);
				return this[methodName](options, rels, aggs, useCache, subsManger, callbacks);//eg: User.orders(opts, rels..)
			}.bind(this);
			

			return handle;
	},


	_prepSubConfig: function(name, options) {
		var sub = this.prototype.subscriptions[name];
		sub = UltimateUtilities.extractConfig(sub, this.prototype);

		options = _.extend({}, sub, options);
		options.selector = options.selector || {};

		this.with(UltimateClone.deepClone(sub.with));
		this.attachAggregates(UltimateClone.deepClone(sub.aggregates), UltimateClone.deepClone(sub.aggregates_selector));
		//relations and aggregates are now stored on model class; eg: User._relations and User._aggregates

		return options;
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