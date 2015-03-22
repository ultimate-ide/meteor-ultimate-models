UltimateReactive.extend({
	autorun: function(func) {
		return this.autorun(func.bind(this));
	},
	subscribe: function() {
		var args = arguments;
		
		if(Tracker.currentComputation) return Meteor.subscribe.apply(Meteor, args);	
		else return this.autorun(function() {
			Meteor.subscribe.apply(Meteor, args);
		});	
	},
	
	
	subscribeLimit: function() {
		var args = _.toArray(arguments),
			startLimit = args.pop();
		
		this.setLimit(startLimit);
			
		if(Tracker.currentComputation) {
			var limit = this.getLimit();
			args.push(limit);
			
			return Meteor.subscribe.apply(Meteor, args);	
		}
		else return this.autorun(function() {
			var limit = this.getLimit();
			args.push(limit);
			
			this._limitSubscribe = Meteor.subscribe.apply(Meteor, args);
		}.bind(this));	
	},
	limitStop: function() {
		if(this._limitSubscribe) this._limitSubscribe.stop();
	},
	limitReady: function() {
		if(this._limitSubscribe) this._limitSubscribe.ready();
	},
	
	
	incrementLimit: function(amount) {
		return this.increment('limit', amount, 'reactive-dict');
	},
	decrementLimit: function(amount) {
		return this.decrement('limit', amount, 'reactive-dict');
	},
	getLimit: function() {
		return this.get('limit', 'reactive-dict');
	},
	setLimit: function(amount) {
		return this.get('limit', amount, 'reactive-dict');
	}
});