Ultimate('UltimatePubSub').extends({
	createPublish: function(name, ModelClass, sub, collection) {	
		var pubSubName = this._pubSubName(name, ModelClass);
		
		Meteor.publish(pubSubName, function(options, relations, aggregates) {
			if(_.isFunction(sub)) sub = sub.call(ModelClass.prototype, this, options, relations, aggregates);
			
			options = _.extend({}, sub, options);
			
			if(!_.isEmpty(aggregates)) new UltimateAggregateCollectionPublisher(this, aggregates, ModelClass);
			
			var urpf = new UltimateRelationsPublisherFactory(this);
			urpf.startPublishing(relations, ModelClass, options.selector, options);
			this.ready();
		});
	},
	createSubscribe: function(name, ModelClass, sub) {	
		var methodName = this._methodName(name, 'subscribe'),
			pubSubName = this._pubSubName(name, ModelClass);
		
		ModelClass[methodName] = function(options, relations, aggregates, useCache, subsManager, callbacks) {
			var subscriber = subsManager || Meteor;
			
			if(!useCache) return subscriber.subscribe(pubSubName, options, relations, aggregates, callbacks);
			

			var usc = new UltimateSubscriptionCache(this, ModelClass, callbacks),
				options = _.extend({}, sub, options);
		
			usc.cache(options, relations, aggregates);
			
			callbacks = {
				onStop: callbacks ? callbacks.onStop : null,
				onReady: usc.onReady.bind(usc)
			};
			
			subscriber.subscribe(pubSubName, options, relations, aggregates, callbacks);
			
			return usc; //has ready() and stop() methods that pass thru to subscriber properly, i.e. duck-typed
		};
	},
	


	_methodName: function(name, type) {
		return type + name.capitalizeOnlyFirstLetter();
	},
	_pubSubName: function(name, ModelClass) {
		return ModelClass.className + name.capitalizeOnlyFirstLetter();
	}
});