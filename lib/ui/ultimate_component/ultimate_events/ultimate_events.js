UltimateEvents = Ultimate('UltimateEvents').extends({
	construct: function(template, ultimateTemplate) {
		this.template = _.isString(template) ? Template[template] : template;
		this.ultimateTemplate = ultimateTemplate;
	},
	
	
	onBeforeStartup: function() {
		Template.ultimateEvents = function(template, dict) {
			var ue = new UltimateEvents(template);
			ue.addEvents(dict);
		};
	},
	
	
	addEvents: function(dict) {
		var eventsMap = {};
		
		for(var selector in dict) {
			var handler = dict[selector];
			eventsMap[selector] = this._createHandler(handler);
		}
	
		this.template.events(eventsMap);
	},
	
	
	_createHandler: function(handler) {
		return _.isArray(handler) ? this._array(handler) : this._func(handler)
	},
	
	
	_array: function(handler) {
		var self = this;
		
		return function(e) {
			var staticArgs = _.clone(handler),
				objString = staticArgs.shift(),
				context = self.__getContext(this, objString),
				method = staticArgs.shift(),
				values = self.__getValues(e);
		
			values = staticArgs.concat(values);
			
			e.preventDefault();
			context[method].apply(context, values);  //usually: this.set(k,v) || this.model().set(k, v);
		};
	},
	_func: function(handler) {
		var self = this;
		
		return function(e, tmpl) {
			var context = self.__getContext(this),
				values = self.__getValues(e);		
				
			values.unshift($(e.currentTarget));
			if(!self.ultimateTemplate) values.unshift(tmpl);
			values.unshift(e);					
			handler.apply(context, values);
		};
	},


	__getValues: function(e) {
		var $el = $(e.currentTarget),
			v = $el.val() || $el.attr('v') || '';
		
		v = v.trim();
		
		return _.map(v.split(','), function(value) {
			return value.trim();
		});
	},
	__getContext: function(context, objString) {		
		var ut = this.ultimateTemplate;
		
		if(ut) { //called from UltimateComponent
			if(!objString) context = ut;
			else if(objString == 'this') context = ut;
			else context = this._getObj(ut, objString);
		} 
		else { //called from Template.ultimateEvents()
			if(objString) context = _.isFunction(context[objString]) ? context[objString]() : context[objString];
			else context = context;
		}
		
		return context;
	},
	_getObj: function(ut, objString) {
		var parts = objString.split('.'),
			propA = parts[0],
			propB = parts[1] || null, 
			level = this._prepLevel(propA), //e.g. parentData(2) extracts the integer 2
			method = this._getMethod(propA);

		if(!method) return ut[propA];
		
		if(level) context = ut[method](level, propB);
		
		//objString: 'model.obj' --> this.model(obj), which is: this.model().obj; also this.model().obj() will work
		else context = _.isFunction(ut[method](propB)) ? ut[method](propB)() : ut[method](propB); 
		
		return context;
	},
	_getMethod: function(prop) {
		var regex = /^model$|^templateModel$|^currentModel$|^routeModel$|^data$|^templateData$|^currentData$|^routeData$/;
		if(regex.test(prop)) return prop;
		else if(prop.indexOf('parentModel') === 0) return 'parentModel';
		else if(prop.indexOf('parentData') === 0) return 'parentData';
		return null;
	},
	_prepLevel: function(prop) {
		return _.isString(prop) ? parseInt(prop.replace(/\D/g, '')) : null;
	}
});