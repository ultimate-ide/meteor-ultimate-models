Ultimate('UltimateRelationsParentPublisher').extends(UltimateRelationsPublisher, {
	construct: function(publisher, ModelClass, selector, options, cachedIdsByCollection) {
		this.publisher = publisher;
		this.cachedIdsByCollection = cachedIdsByCollection;
		this.setupParent(ModelClass, selector, options);
	},
	setupParent: function(ModelClass, selector, options) {
		this.type = 'subscription';
		this.collection = ModelClass.collection; 	
		this.modelClass = ModelClass;
		this.selector = selector;
		this.options = options;
		this.options.transform = null;
		
		this.updateObserver();
	}
});