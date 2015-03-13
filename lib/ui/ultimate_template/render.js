//{{>render someTemplate|data}}
Template.render.helpers({
	getTemplate: function() {
		return this.template || this.valueOf();
	},
	newData: function() {
		var helpers = UltimateComponent.get(this.template).getHelpers();
		return _.extend(this, helpers);
	}
});