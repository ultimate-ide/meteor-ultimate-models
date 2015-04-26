UltimateClass.extend({
	setTimeout: function(func, delay) {
		return Meteor.setTimeout(func.bind(this), delay);
	},
	setInterval: function(func, delay) {
		return Meteor.setInterval(func.bind(this), delay);
	},
	setIntervalUntil: function(func, delay, maxCalls) {
		var isComplete = false,
			startTime = new Date,
			maxCalls = maxCalls || 1000,
			maxMs = delay * maxCalls,
			interval = Meteor.setInterval(function() {
				isComplete = func.call(this);
				if(isComplete) this.clearInterval(interval);
				
				if((new Date) - startTime > maxMs) this.clearInterval(interval);
			}.bind(this), delay);
	},
	clearTimeout: function(id) {
		Meteor.clearTimeout(id);
	},
	clearInterval: function(id) {
		Meteor.clearInterval(id);
	}
});


Function.extend({
	setTimeout: function(func, delay) {
		return Meteor.setTimeout(func.bind(this), delay);
	},
	setInterval: function(func, delay) {
		return Meteor.setInterval(func.bind(this), delay);
	},
	setIntervalUntil: function(func, delay) {
		var isComplete = false,
			interval = Meteor.setInterval(function() {
				isComplete = func.bind(this);
			}.bind(this), delay);
		
		if(isComplete) this.clearInterval(interval);
	},
	clearTimeout: function(id) {
		Meteor.clearTimeout(id);
	},
	clearInterval: function(id) {
		Meteor.clearInterval(id);
	}
});