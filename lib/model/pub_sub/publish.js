UltimateModel.extend({
	onChildClassBeforeStartup: function() {
		this.createPubSubs();
		this.createRelationMethods();
		this.createAggregateClassMethods();
		this.createAggregateBasicClassMethods();
		this.createAggregateMethods();
	},
	createPubSubs: function() {
		_.each(this.prototype.subscriptions, function(sub, name) {
			sub = UltimateClone.deepClone(sub);
			
			UltimatePubSub.createPublish(name, this.class, sub, this.collection);	
			UltimatePubSub.createSubscribe(name, this.class);
			
			this.createClassMethods(name, sub, this.collection);
		}, this);
	}
});