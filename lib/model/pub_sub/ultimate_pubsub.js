Ultimate('UltimatePubSub').extends({
	createPublish: function(name, ModelClass, sub, collection) {	
		var pubSubName = this._pubSubName(name, ModelClass);
		
		if(_.isFunction(sub)) return Meteor.publish(pubSubName, sub);
		
		Meteor.publish(pubSubName, function(options, relations, aggregates) {
			options = _.extend({}, sub, options);
			selector = _.extend({}, sub.selector, options ? options.selector : null);
			
			if(!_.isEmpty(aggregates)) new UltimateAggregateCollectionPublisher(this, aggregates, ModelClass);
			
			if(_.isEmpty(relations)) return collection.find(selector, options);
			else new UltimateRelationsPublisherFactory(this, relations, ModelClass, selector, options);
		});
	},
	createSubscribe: function(name, ModelClass) {	
		var methodName = this._methodName(name, 'subscribe'),
			pubSubName = this._pubSubName(name, ModelClass);
		
		ModelClass[methodName] = function(options, relations, aggregates) {
			var sub = this._subsManager || Meteor;
			return sub.subscribe(pubSubName, options, relations, aggregates);
		};
	},
	


	_methodName: function(name, type) {
		return type + name.capitalizeOnlyFirstLetter();
	},
	_pubSubName: function(name, ModelClass) {
		return ModelClass.className + name.capitalizeOnlyFirstLetter();
	}
});