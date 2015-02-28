UltimateEvents = function UltimateEvents(ultimateTemplateInstance) {
	this.ultimateTemplate = ultimateTemplateInstance;
};

UltimateEvents = UltimateEvents.extends({
	onBeforeStartup: function() {
		Template.ultimateEvents = function(template, dict) {
			var ue = new UltimateEvents;
			ue.addEvents(template, dict);
		};
	},
	
	
	addEvents: function(template, dict) {
		var eventsMap = {};
		
		for(var selector in dict) {
			var handler = dict[selector];
			eventsMap[selector] = this._createHandler(handler);
		}
	
		if(_.isString(template)) Template[template].events(eventsMap);	
		else template.events(eventsMap);
	},
	
	
	_createHandler: function(handler) {
		return _.isArray(handler) ? this._array(handler) : this._func(handler)
	},
	
	
	_array: function(handler) {
		var self = this;
		
		return function(e) {
			var staticArgs = _.clone(handler),
				objString = staticArgs.shift(),
				tmpl = this.ultimateTemplate,
				context = objString == 'this' ? tmpl : (objString == 'model' ? tmpl.model() : tmpl[objString]),
				method = staticArgs.shift(),
				values = self.__getValues(e);
		
			values = staticArgs.concat(values);
			
			e.preventDefault();
			context[method].apply(context, values);  //usually: this.set(k,v) || this.model().set(k, v);
		};
	},
	_func: function(handler) {
		var self = this;
		
		return function(e) {
			var values = self.__getValues(e);		
			values.unshift($(e.currentTarget));
			values.unshift(e);					
			handler.apply(self.ultimateTemplate, values);
		};
	},


	__getValues: function(e) {
		var $el = $(e.currentTarget),
			v = $el.val() || $el.attr('v').trim();
		
		return _.map(v.split(','), function(value) {
			return value.trim();
		});
	}
});