Ultimate('UltimateRelationsParentPublisher').extends(UltimateRelationsPublisher, {
	construct: function(publisher, ModelClass, selector, options) {
		this.publisher = publisher;
		this.setupParent(ModelClass, selector, options);
	},
	setupParent: function(ModelClass, selector, options) {
		this.collection = ModelClass.collection; 	
		this.modelClass = ModelClass;
		this.selector = selector;
		this.options = options;
		this.options.transform = null;
		
		this.updateObserver();
	}
});