UltimateComponent.extend({
	instance: function(prop, val) {
		if(arguments.length === 0) return Template.instance();
		else if(arguments.length === 1) {
			if(_.isFunction(Template.instance()[prop])) return Template.instance()[prop].call(this);
			else return Template.instance()[prop];
		}
		else if(arguments.length === 2) return Template.instance()[prop] = val;
	},


	parentInstance: function(levels) {
		return Template.parentInstance(levels);
	},
	
	
	$: function(selector) {
		return this.instance().$(selector);
	},
	find: function(selector) {
		return this.instance().find(selector);
	},
	findAll: function(selector) {
		return this.instance().findAll(selector);
	},
	firsNode: function() {
		return this.instance().firsNode;
	},
	lastNode: function() {
		return this.instance().lastNode;
	},
	view: function() {
		return this.instance().view;
	},


	autorun: function(func) {
		return this.instance().autorun(func.bind(this));
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
	
	
	setReactiveIntervalUntil: function(funcReturnsTrue, delay, id, maxIntervals) {
		id = id || 'reactive';
		maxIntervals = maxIntervals || 60 * 120; //2 hours is default max
		
		if(!this.get(id)) {
			var interval = this.setIntervalUntil(function() {
				
				if(funcReturnsTrue.call(this)) this.clearInterval(interval);
				else this.set(id, new Date); //functions as a basic reactive "tick"
					
			}, delay, maxIntervals);	
		}
	};
});



Blaze.TemplateInstance.prototype.parentTemplate = function(levels) {
    var view = Blaze.currentView;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.substring(0, 9) === "Template." && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};

Template.parentInstance = function(levels) {
	Template.instance().parentTemplate(levels);
}