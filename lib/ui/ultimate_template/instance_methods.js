UltimateTemplate.extend({
	instance: function(prop, val) {
		if(arguments.length === 0) return Template.instance();
		else if(arguments.length === 1) {
			if(_.isFunction(Template.instance()[prop])) return Template.instance()[prop]();
			else return Template.instance()[prop];
		};
		else if(arguments.length === 2) return Template.instance()[prop] = val;
	},
	autorun: function(func) {
		return this.instance().autorun(func);
	},
	subscribe: function() {
		var args = arguments;
		
		return this.autorun(function() {
			Meteor.subscribe.apply(Meteor, args);
		});	
	}
});