UltimateReactive.extend({
	autorun: function(func, name) {
		if(!_.isFunction(func)) return;
		
		if(Tracker.currentComputation && !name) {
			var computation = Tracker.currentComputation;
			func.call(this, computation);
		}
		else var computation = Meteor.autorun(func.bind(this));
		
		this._addComputation(computation, name || computation._id);
		
		return computation;
	},
	subscribe: function() {
		var args = _.toArray(arguments),
			subName = args[0];
			
		this.autorun(this._execSub.bind(this, args, subName));
		return this._subscriptions[subName];	
	},
	
	
	subscribeLimit: function() {
		var args = _.toArray(arguments),
			subName = args[0],
			startLimit = args.pop();
		
		this.setLimit(startLimit);
		this.autorun(this._execSubLimit.bind(this, args, subName));	
		return this._subscriptions[subName];	
	},
	_execSub: function(args, subName) {
		var sub = Meteor.subscribe.apply(Meteor, args);
		this._addSub(sub, subName);
	},
	_execSubLimit: function(args, subName) {
		args.push(this.getLimit());
		this._execSub(args, subName);
	},
	_addSub: function(sub, name) {
		if(!this._subscriptions) this._subscriptions = {};
		this._subscriptions[name] = sub;
		this.mainSubscribeLimitName = name;
	},
	_addComputation: function(comp, name) {
		if(!this._computations) this._computations = {};
		this._computations[name] = comp;
	},
	
	
	incrementLimit: function(amount, name) {
		return this.increment(this._limitName(name), amount, 'reactive-dict');
	},
	decrementLimit: function(amount, name) {
		return this.decrement(this._limitName(name), amount, 'reactive-dict');
	},
	getLimit: function(name) {
		return this.get(this._limitName(name), 'reactive-dict');
	},
	setLimit: function(amount, name) {
		return this.get(this._limitName(name), amount, 'reactive-dict');
	},
	_limitName: function(name) {
		return name ? 'limit_'+name : 'limit_'+this.mainSubscribeLimitName;
	},
	
	

	getComputation: function(name) {
		return this._computations[name];
	},
	getSubscription: function(name) {
		return this._subscriptions[name];
	},
	getAllComputations: function() {
		return this._computations;
	},
	getAllSubscriptions: function() {
		return this._subscriptions;
	},
	
	
	stop: function(name) {
		if(!name) {
			_.each(this._subscriptions, function(sub) {
				sub.stop();
			});
			_.each(this._computations, function(c) {
				c.stop();
			});
		}
		else {
			_.each(this._subscriptions, function(sub, subName) {
				if(subName == name) sub.stop();  
			});	
			_.each(this._computations, function(c, cName) {
				if(cName == name) c.stop();  
			});
		}
	},
	ready: function(name) {
		var ready ;
		
		if(!name) {
			_.some(this._subscriptions, function(sub) {
				ready = sub.ready();
				if(ready === false) return true;
			});
		}
		else {			
			_.some(this._subscriptions, function(sub, subName) {
				if(subName == name) {
					ready = sub.ready(); 
					return true;
				}
			});	
		}
		
		return ready;
	}
});