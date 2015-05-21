Ultimate('UltimateRelationsPublisher').extends({
	onAfterConstruct: function() {
		this.publisher.onStop(this.stopObserving.bind(this));
	},
	updateObserver: function() {
		this.prepareCursor();	
		this.observe();
		this.removeOldIds();
		this.emit('cursorChange');
	},
	prepareCursor: function() {
		this.oldCursor = this.cursor;
		console.log('INPUT', this.type, this.collection._name, this.selector, this.options.sort);

		var options = UltimateUtilities.pickCollectionOptions(this.options);
		this.cursor = this.collection.find(this.selector, options);
	},

	
	observe: function() {
		var initializing = true,
			self = this;
		
		this.stopObserving();
		
		this.observer = this.getCursor().observe({
			added: function(doc) {
				self._runPublisherMethod('added', initializing, doc);//added called on same id, does nothing
			},
			removed: function(doc) {
				self._runPublisherMethod('removed', initializing, doc);
			},
			changed: function(doc) {
				self._runPublisherMethod('changed', initializing, doc); //could be optimized to only emit if fks change
			}
		});
		
		initializing = false;

		console.log('OUTPUT', this.type, this.collection._name, this.outputIds());
	},	
	stopObserving: function() {
		if(this.observer) this.observer.stop();
	},
	_runPublisherMethod: function(method, initializing, doc) {
		console.log('PUBLISH', this.through, initializing, this.collection._name, method, doc && doc._id);
		if(!this.through) this.publisher[method].apply(this.publisher, [this.collection._name, doc._id, doc]);
		if(!initializing) this.emit('cursorChange'); //could be optimized to only emit on changes to ids or fks
	},
	
	
	removeOldIds: function() {
		if(!this.oldCursor || this.through) return; //we may not need to check this.through, i forget.

		var oldIds = this.fetchIds(this.getOldCursor()),
			newIds = this.fetchIds(this.getCursor()),
			removedIds = _.difference(oldIds, newIds);
			
		removedIds.forEach(function(id) {
			this.publisher.removed(this.collection._name, id);
		}, this);
	},
	getCursor: function() {
		return this.cursor;
	},
	getOldCursor: function() {
		return this.oldCursor;
	},


	getParent: function() {
		return this.parentPublisher;
	},
	fetchIds: function(cursor) {
		return cursor.map(function(model) {
			return model._id;
		});
	},
	fetchValues: function(cursor, fk) {
		return cursor.map(function(model) {
			return model[fk];
		});
	},
	inputIds: function() {
		return this.getParent() ? this.fetchIds(this.getParent().getCursor()) : [];
	},
	outputIds: function() {
		return this.fetchIds(this.getCursor());
	}
});