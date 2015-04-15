UltimateComponent = Ultimate('UltimateComponent').extends(UltimateReactive, {
	isComponent: true,
	template: null,
	templateName: null,
	
	onCreated: function() {},
	onRendered: function() {},
	onDestroyed: function() {},

	blockReactiveStartup: true, //block UltimateReactive.onStartup from running
	
	mixinHelpers: [],
	mixinEvents: [],
	mixinCallbacks: [],
	
	
	onCreatedCallbacks: [];
	onRenderedCallbacks: [];
	onDestroyedCallbacks: [];
	
	
	includes: [],
	
	onChildClassBeforeStartup: function() {
		var UC = this.createNew();
		
		UC.rememberComponent();
		
		UC.setupMixins();
		
		if(!UC.template) return;
		
		UC.setupHelpers();
		UC.setupEvents();
		UC.setupCallbacks();
		UC.setupIncludes();
	},
	
	rememberComponent: function() {
		UltimateComponent.components[this.className] = UltimateComponent.componentsByTemplateName[this.templateName] = this;
	},
	setupHelpers: function() {
		var helpersMap = this.getHelpers();
		this.template.helpers(helpersMap);
	},
	setupEvents: function() {
		var UE = new UltimateEvents(this.template, this),
			eventsMap = this.getEvents();
		
		UE.addEvents(eventsMap);	
	},
	setupCallbacks: function() {
		this.template.onCreated = function() {
			this.runReactiveMethods();
			
			this._currentComponentInstance = Template.instance();
			Template.instance().className = this.className;	
			
			this.construct.call(this);
			
			_.invokeNext(this.onCreatedCallbacks, 'call', this);
		}.bind(this);
	

		this.template.onRendered = function() {
			_.invokeNext(this.onRenderedCallbacks, 'call', this);
		}.bind(this);
		
		this.template.onDestroyed = function() {
			_.invokeNext(this.onDestroyedCallbacks, 'call', this);
		}.bind(this);
	},
	setupIncludes: function() {
		_.each(this.includes, function(name) {
			var helpersMap = this.getHelpers();
			Template[name].helpers(helpersMap);	
			
			//if component exists for template, its helpers override helpers included from other components
			var component = UltimateComponent.componentsByTemplateName[name];
			if(component) component.setupHelpers(); 
		}, this);
	},
	
	
	getHelpers: function() {	
		var helpers = _.filterObject(this, this._isHelper, this, this._resolveHelper);
		this._attachSpecialHelpers(helpers);
		return helpers;
	},
	_isHelper: function(event, prop) {
		this._reservedRegex = this._reservedRegex || /^(onCreated|onRendered|onDestroyed|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;	
		return !this._reservedRegex.test(prop) && !this._isBaseMethod(prop) && this._isFunction(prop);
	},
	_isFunction: function(prop) {
		return _.isFunction(this[prop]) || (_.isArray(this[prop]) && this[prop].length > 0); 
	},
	_resolveHelper: function(event, prop) {
		var func;
		
		if(_.isArray(this[prop])) func = this._helperShortcut(prop).bind(this);
		else func = this[prop];
		
		return this._applyBind(func);
	},
	_applyBind: function(func) {
		if(this.isUltimateComponentModel) {
			var uc = this;
			
			return function() {
				this.component = uc;
				return func.apply(this, arguments);
			};
		}
		else return func.bind(this); 
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
		return _.filterObject(this, this._isEvent);
	},
	_isEvent: function(event, prop) {
		this._eventsRegex = this._eventsRegex || /^(click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;			
		return this._eventsRegex.test(prop) && !this._isBaseMethod(prop);
	},
	
	
	_isBaseMethod: function(prop) {
		return UltimateComponent.prototype.hasOwnProperty(prop) || UltimateClass.prototype.hasOwnProperty(prop)
	}
});

UltimateComponent.extendStatic({
	components: {},
	componentsByTemplateName: {}
});