UltimateComponent = Ultimate('UltimateComponent').extends({
	isComponent: true,
	template: null,
	templateName: null,
	
	onCreated: function() {},
	onRendered: function() {},
	onDestroyed: function() {},

	mixins: [UltimateReactive],
	
	mixinHelpers: [],
	mixinEvents: [],
	mixinCallbacks: [],
	
	includes: [],
	
	onChildClassStartup: function() {
		var UT = this.createNew();
		
		UT.rememberComponent();
		
		UT.setupMixins();
		
		if(!UT.template) return;
		
		UT.setupHelpers();
		UT.setupEvents();
		UT.setupCallbacks();
		UT.setupIncludes();
	},
	
	rememberComponent: function() {
		UltimateComponent.components[this.className] = UltimateComponent.templates[this.templateName] = this;
	},
	setupHelpers: function() {
		var helpersMap = this.getHelpers();
		this.template.helpers(helpersMap);
	},
	setupEvents: function() {
		var UE = new UltimateEvents(this.template, this),
			eventsMap = UT.getEvents();
		
		UE.addEvents(eventsMap);	
	},
	setupCallbacks: function() {
		var subscribe = this._getSubscribe(),
			subscribeLimit = this._getSubscribeLimit(),
			autorun = this._getAutorun();
		
		this.template.onCreated = function() {
			if(subscribeLimit) subscribeLimit();
			if(subscribe) subscribe();
			if(autorun) autorun();
			
			this._currentComponentInstance = Template.instance();
			Template.instance().className = this.className;
			
			
			this.construct.call(this);
			this.onCreated.call(this);
		}.bind(this);
	
		this.template.onRendered = this.onRendered.bind(this);	
		this.template.onDestroyed = this.onDestroyed.bind(this);
	},
	setupIncludes: function() {
		_.each(this.includes, function(name) {
			var helpersMap = this.getHelpers();
			Template[name].helpers(helpersMap);	
			
			//if component exists for template, its helpers override helpers included from other components
			if(component) component.setupHelpers(); 
		}.bind(this));
	},
	
	
	getHelpers: function() {
		var helpers = {};
		
		for(var prop in this) {
			if(this._isHelper(prop)) helpers[prop] = this._resolveHelper(prop);
		}
		
		this._attachSpecialHelpers(helpers);
		return helpers;
	},
	_isHelper: function(prop, ) {
		this._reservedRegex = this._reservedRegex || /^(onCreated|onRendered|onDestroyed|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;	
		return !this._reservedRegex.test(prop) && !this._isBaseMethod(prop) && this._isFunction(prop);
	},
	_isFunction: function(prop) {
		return _.isFunction(this[prop]) || (_.isArray(this[prop]) && this[prop].length > 0); 
	},
	_resolveHelper: function(prop) {
		if(_.isArray(this[prop])) return this._helperShortcut(prop);
		else return this[prop].bind(this);
	},
	_attachSpecialHelpers: function(helpers) {
		helpers.instance = this.instance.bind(this); //put instance() into html template code
		helpers.templateInstance = this.templateInstance.bind(this); //put this.templateInstance() into html template code
		helpers.get = this.get.bind(this); //put instance().get into html template code
		helpers.getLimit = this.getLimit.bind(this); //etc
		helpers.model = this.model.bind(this);
		helpers.routeModel = this.routeModel.bind(this);
		helpers.componentModel = this.componentModel.bind(this);
		helpers.parentModel = this.parentModel.bind(this);
		helpers.routeData = this.routeData.bind(this);
		helpers.componentData = this.componentData.bind(this);
		helpers.parentData = this.parentData.bind(this);
	},
	
	getEvents: function() {
		var events = {};
	
		for(var prop in this) {
			if(this._isEvent(prop)) {
				events[prop] = this[prop];
			}
		}
	
		return events;
	},
	_isEvent: function(prop) {
		this._eventsRegex = this._eventsRegex || /^(click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;			
		return this._eventsRegex.test(prop) && !this._isBaseMethod(prop);
	},
	
	
	_isBaseMethod: function(prop) {
		return UltimateComponent.prototype.hasOwnProperty(prop) || UltimateClass.prototype.hasOwnProperty(prop)
	}
});

UltimateComponent.extendStatic({
	components: {},
	templates: {}
});