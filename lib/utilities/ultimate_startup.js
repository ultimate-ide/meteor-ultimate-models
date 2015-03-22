Ultimate('UltimateStartup').extends({
	onChildClassStartup: function() {
		var startupClass = this.createNew(),
			methods = startupClass.getMethods();
			
		_.each(methods, function(method) {
			Meteor.onStartup(method);
		});
	},
	
	
	getMethods: function() {
		var methods = [];
	
		for(var prop in this) {
			if(this.isMethod(prop)) {
				methods.push(this[prop].bind(this));
			}
		}
	
		if(this.autorun) methods.autorun = this._getAutorun();
		if(this.subscribe) methods.autorun = this._getSubscribe();
		
		
		return methods;
	},
	isMethod: function(prop) {
		var regex = /^(autorun|subscribe)(\s|$)/;	
		return this.___proto.hasOwnProperty(prop) && prop.indexOf('_') !== 0 && !regex.test(prop);
	},
	
	
	_getAutorun: function() {
		var ar = null;
		
		if(this.___proto.hasOwnProperty('autorun')) {
			var autorun = this.___proto.autorun;
			delete this.___proto.autorun;
			
			ar = function() {
				this.autorun(function(computation) {
					autorun.call(this, computation); 
				}.bind(this));
			}.bind(this);
		}
		
		return ar;
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
});