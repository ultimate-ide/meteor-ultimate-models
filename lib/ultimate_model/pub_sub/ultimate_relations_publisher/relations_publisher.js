Ultimate('UltimateRelationsPublisher').extends(UltimateBaseRelationsPublisher, {
	onAfterConstruct: function() {
		this.publisher.onStop(this.stopObserving.bind(this));
	}
	updateObserver: function() {
		if(this.resetRelationFunc) this.resetRelationFunc();
		this.prepareCursor();	
		this.observe();
		if(this.oldCursor && !this.through) this.removeOldIds();
		this.emit('cursorChange');
	},
	prepareCursor: function() {
		this.oldCursor = this.cursor;
		this.cursor = this.collection.find(this.selector, this.options);
	},
	
	
	observe: function() {
		var initializing = true;
		
		this.stopObserving();
		
		this.observer = this.getCursor().observe({
			added: this._runPublisherMethod.bind(this, 'added', initializing), //added called on same id, does nothing
			removed: this._runPublisherMethod.bind(this, 'removed', initializing),
			changed: this._runPublisherMethod.bind(this, 'changed', initializing), //could be optimized to only emit if fks change
		});
		
		initializing = false;
	},	
	stopObserving: function() {
		if(this.observer) this.observer.stop();
	},
	_runPublisherMethod: function(method, initializing, doc) {
		if(!this.through) this.publisher[method].apply(this.publisher, [this.collection._name, doc._id, doc]);
		if(!initializing) this.emit('cursorChange'); //could be optimized to only emit on changes to ids or fks
	},
	
	
	removeOldIds: function() {
		var removedIds = _.difference(this.getOldCursor().fetchIds(), this.getCursor().fetchIds());
			
		removedIds.forEach(function(id) {
			this.publisher.removed(this.collection._name, id);
		}, this);
	}
	getCursor: function() {
		return this.cursor;
	},
	getOldCursor: function() {
		return this.oldCursor;
	}
});