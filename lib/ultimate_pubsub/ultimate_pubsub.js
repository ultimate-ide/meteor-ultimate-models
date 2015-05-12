Ultimate('UltimatePubsub').extends(UltimateBehavior, {}, {
	attachTo: ['UltimateModel'],

	onAttachedToOwner: function() {
		console.log('UltimatePubsub::onAttachOwner', this.className);
		this.createPubSubs();
		this.createRelationMethods();
	},
	createPubSubs: function() {
		var subscriptions = this.ownerPrototype().subscriptions;

		_.each(subscriptions, function(sub, name) {
			var proto = this.ownerPrototype(),
				userId = Meteor.userId(),
				collection = this.owner().collection,
				Class = this.ownerClass();

			sub = _.isFunction(sub) ? sub.call(proto, userId) : UltimateClone.deepClone(sub);
			
			if(Meteor.isServer) this.createPublish(sub, name, Class, collection);	
			if(Meteor.isClient) this.createSubscribe(sub, name, Class);
			
			this.createClassMethods(sub, name, collection);
		}, this);
	},


	createPublish: function(sub, name, Class, collection) {	
		var pubSubName = this._pubSubName(Class, name);
		
		Meteor.publish(pubSubName, function(options, relations, aggregates) {
			if(_.isFunction(sub)) sub = sub.call(Class.prototype, this, options, relations, aggregates);
			
			options = _.extend({}, sub, options);
			
			if(!_.isEmpty(aggregates)) new UltimateAggregateCollectionPublisher(this, aggregates, Class);
			
			var urpf = new UltimateRelationsPublisherFactory(this);
			urpf.startPublishing(relations, Class, options.selector, options);
			this.ready();
		});
	},
	createSubscribe: function(sub, name, Class) {	
		var methodName = this._methodName('subscribe', name),
			pubSubName = this._pubSubName(Class, name);
		
		Class[methodName] = function(options, relations, aggregates, useCache, subsManager, callbacks) {
			var subscriber = subsManager || Meteor;
			
			if(!useCache) return subscriber.subscribe(pubSubName, options, relations, aggregates, callbacks);
			

			var usc = new UltimateSubscriptionCache(this, Class, callbacks),
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
	createClassMethods: function(sub, name, collection) {	
		this.class[name] = function(selector, options) { //create function, eg: Orders.recent();
			selector = _.extend({}, sub.selector, selector);
			options = _.extend({}, sub, options);
			
			var findName = options.limit == 1 ? 'findOne' : 'find';
			
			return collection[findName](selector, options);
		};
	},


	createRelationMethods: function() {
		var relations = this.owner().getPrototype().relations;

		_.each(relations, function(rel, name) {
			this._createRelationMethod(name, rel);
		}, this);
	},
	_createRelationMethod: function(name, rel) {
		var proto = this.owner().getPrototype(),
			collection = this.owner().collection,
			findName = rel.relation == 'has_one' || rel.relation == 'belongs_to' ? 'findOne' : 'find';
			
		proto[name] = function(selector, options) { //create function, eg: user.orders();
			selector = _.extend({}, rel.options ? rel.options.selector : null, selector);
			options = _.extend({}, rel.options, options);
			
			if(options.limit == 1) findName = 'findOne';
			
			return collection[findName](selector, options);
		};
	},


	_methodName: function(type, name) {
		return type + name.capitalizeOnlyFirstLetter();
	},
	_pubSubName: function(Class, name) {
		return Class.className + name.capitalizeOnlyFirstLetter();
	}
});


