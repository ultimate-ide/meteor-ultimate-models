UltimateEvents = function UltimateEvents(propName) {
	this.prop = propName || 'model';
};

UltimateEvents = UltimateEvents.extends({
	addEvents: function(templateName, dict) {
		var eventsMap = {};
		
		for(var selector in dict) {
			var handler = dict[selector];
			eventsMap[selector] = this._createHandler(handler);
		}
	
		Template[templateName].events(eventsMap);	
	},
	
	
	_createHandler: function(handler) {
		return _.isArray(handler) ? this._array(handler) : this._func(handler)
	},
	
	
	_array: function(handler) {
		var self = this;
		
		return function(e) {
			var staticArgs = _.clone(handler);
				method = staticArgs.shift(),
				values = self.__getValues(e),
				model = self.__getModel(this);
		
			values = staticArgs.concat(values)
			
			model[method].apply(model, values);  //usually this.model.set(k, v);
		};
	},
	_func: function(handler) {
		var self = this;
		
		return function(e) {
			var values = self.__getValues(e),
				model = self.__getModel(this);
		
			if(_.isString(handler)) handler = model[handler];				
			handler.apply(model, values);
		};
	},


	__getValues: function(e) {
		var v = $(e.currentTarget).attr('v').trim();
		
		return _.map(v.split(','), function(value) {
			return value.trim();
		});
	},
	__getModel: function(context) {
		if(context._id && context.className) return context;
		else return context[this.prop]; //typically this.model, but other props in the templates data context can be used		
	}
});



Template.ultimateEvents = function(templateName, dict, propName) {
	var ue = new UltimateEvents(propName);
	ue.addEvents(templateName, dict);
};