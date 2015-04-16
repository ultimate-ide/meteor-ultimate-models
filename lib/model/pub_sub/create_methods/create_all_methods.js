UltimateModel.extend({
	createAllMethods: function() {
		this.createPubSubs();
		this.createRelationMethods();
		
		var creator = new CreateAggregateMethods(this.class);
		creator.createAggregateClassMethods();
		creator.createAggregateBasicClassMethods();
		creator.createAggregateMethods();
	},
	createPubSubs: function() {
		_.each(this.___proto.subscriptions, function(sub, name) {
			sub = _.isFunction(sub) ? sub.call(this.___proto, Meteor.userId()) : UltimateClone.deepClone(sub);
			
			var helper = new UltimatePubSubHelper(name);
			
			if(Meteor.isServer) helper.createPublish(this.class, sub, this.collection);	
			if(Meteor.isClient) helper.createSubscribe(this.class, sub);
			
			this.createClassMethods(name, sub, this.collection);
		}, this);
	}
});