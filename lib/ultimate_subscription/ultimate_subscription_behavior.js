Ultimate('UltimateSubscriptionBehavior').extends(UltimateBehavior, {}, {
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		var subscriptions = this.ownerPrototype().subscriptions
		this.addSubscriptions(subscriptions);

		this.ownerPrototype().on('methodsAdded', function(methods) {
			this.addSubscriptions(methods.subscriptions);
		}.bind(this));
	},


	addSubscriptions: function(subscriptions) {
		var Class = this.ownerClass();

		_.each(subscriptions, function(sub, name) {
			if(Meteor.isServer) this.createPublish(sub, name, Class);	
			if(Meteor.isClient) this.createSubscribe(sub, name, Class);

			this.createClassMethods(sub, name, Class);
		}, this);
	},
	createPublish: function(sub, name, Class) {	
		var pubSubName = this._pubSubName(Class, name);
		
		Meteor.publish(pubSubName, function(options, relations, aggregates) {	
			if(!_.isEmpty(aggregates)) new UltimateAggregateCollectionPublisher(this, aggregates, Class);
			var urpf = new UltimateRelationsPublisherFactory(this);
			urpf.startPublishing(relations, Class, options.selector, options, name);
			this.ready();
		});
	},
	createSubscribe: function(sub, name, Class) {	
		var methodName = this._methodName('subscribe', name),
			pubSubName = this._pubSubName(Class, name);

		Class[methodName] = function(options, relations, aggregates, useCache, subsManager, callbacks) {
			var subscriber = subsManager || Meteor;	

			if(!useCache) return subscriber.subscribe(pubSubName, options, relations, aggregates, callbacks);
			else {
				var usc = new UltimateSubscriptionCache(this, Class, callbacks);
				var callbacks = usc.cache(options, relations, aggregates);
				
				subscriber.subscribe(pubSubName, options, relations, aggregates, callbacks);
				return usc; //has ready() and stop() methods that pass thru to subscriber properly, i.e. duck-typed
			}
		};
	},
	createClassMethods: function(sub, name, Class) {	
		Class[name] = function(selector, options) { //create function, eg: Orders.recent();
			selector = _.extend({}, sub.selector, selector);
			options = _.extend({}, sub, options);
			
			var findName = options.limit == 1 ? 'findOne' : 'find';
			
			return Class.collection[findName](selector, options);
		};
	},


	_methodName: function(type, name) {
		return type + name.capitalizeOnlyFirstLetter();
	},
	_pubSubName: function(Class, name) {
		return Class.className + name.capitalizeOnlyFirstLetter();
	}
});

