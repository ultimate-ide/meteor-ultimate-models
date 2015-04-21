Ultimate('UltimateComponentParent').extends(UltimateReactive, {
	isComponent: true,
	abstract: true,
	template: null,
	templateName: null,
	
	onCreated: function() {},
	onRendered: function() {},
	onDestroyed: function() {},

	mixinHelpers: [],
	mixinEvents: [],
	mixinCallbacks: [],
	
	
	onCreatedCallbacks: [],
	onRenderedCallbacks: [],
	onDestroyedCallbacks: [],
	
	
	includes: [],
	
	onBeforeStartup: function() {
		var UC = this.createNew();
		
		UC.rememberComponent();
		UC.emit('beforeComponentStartup'); //let UltimateDatatableComponent copy template first 
		
		UC.setupMixins();
		
		if(!UC.template) return;
		
		UC.setupHelpers();
		UC.setupEvents();
		UC.setupCallbacks();
		UC.setupAnimations();
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
		this.template.onCreated = function(uc) {
			uc.currentEvent = null;
			uc.runReactiveMethods();
			
			uc._currentComponentInstance = Template.instance();
			Template.instance().className = uc.className;	
			
			uc.construct.call(this);
			
			_.invokeNext(uc.onCreatedCallbacks, 'call', this);
		};
	

		this.template.onRendered = function(uc) {
			uc.currentEvent = null;
			uc.setupAnimations(this);
			_.invokeNext(uc.onRenderedCallbacks, 'call', this);
		};
		
		this.template.onDestroyed = function(uc) {
			uc.currentEvent = null;
			_.invokeNext(uc.onDestroyedCallbacks, 'call', this);
		};
		
		this._applyBind(this.template.onCreated, true, this);
		this._applyBind(this.template.onRendered, true, this);
		this._applyBind(this.template.onDestroyed, true, this);
	},
	setupAnimations: function(ctx) {
		var tmplInstance = ctx.component || ctx; //UltimateComponentModel.component || UltimateComponent
				
		_.chain(this.getAnimations())
			.each(function(handler, selector) {
				var hookName = selector.firstWord(), //return insertElement from, eg, 'insertElement .someClass'
					isTopNode = !selector.split(' ')[1],
					els = isTopNode ? [tmplInstance.firsNode] : tmplInstance.findAll(selector);
					
		   	els.forEach(function(el) {
					if(_.isArray(handler)) {
						if(hookName == 'insertElement') el._uihooks[hookName] = this.__insertElementWithAnimation.bind(ctx, handler);
						else if(hookName == 'removeElement') el._uihooks[hookName] = this.__removeElementWithAnimation.bind(ctx, handler);					
					}
					else el._uihooks[hookName] = handler.bind(renderedContext);
				});
			}, this);
	},
	getAnimations: function() {
		return _.filterObject(this, this._isAnimation);
	},
	_isAnimation: function(event, prop) {
		this._animationsRegex = this._animationsRegex || /^(insertElement|moveElement|removeElement|fadeIn|fadeOut)(\s|$)/;			
		return this._animationsRegex.test(prop) && !this._isBaseMethod(prop);
	},
	__insertElementWithAnimation: function(cssAndOptionsArray, node, next) {
		var css = _.mapObjectAndCall(cssAndOptionsArray[0], this),
			options = _.mapObjectAndCall(cssAndOptionsArray[1], this);
		
		$(node).insertBefore(next).velocity(css, options);
	},
	__removeElementWithAnimation: function(cssAndOptionsArray, node) {
		var css = _.mapObjectAndCall(cssAndOptionsArray[0], this),
			options = _.mapObjectAndCall(cssAndOptionsArray[1], this);
	
		options.complete = function() {
	    $(node).remove();
	  };
	
		$(node).velocity(css, options);
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
		return _.chain(this)
			.filterObject(this._isHelper)
			.mapObject(this._resolveHelper)
			.mapObject(this._applyBind)
			.extend(this._getSpecialHelpers())
			.value();
	},
	_isHelper: function(event, prop) {
		this._reservedRegex = this._reservedRegex || /^(onCreated|onRendered|onDestroyed|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;	
		return !this._reservedRegex.test(prop) && !this._isBaseMethod(prop) && this._isFunction(prop);
	},
	_isFunction: function(prop) {
		return _.isFunction(this[prop]) || (_.isArray(this[prop]) && this[prop].length > 0); 
	},
	_resolveHelper: function(event, prop) {
		var uc = this;
		
		if(_.isArray(this[prop])) return this._helperShortcut(prop);
		else return function() {
			var returnVal = uc[prop].call(this);
			uc.currentEvent = null;
			return returnVal;
		};
	},
	_getSpecialHelpers: function() {
		return _.pickAndBind(this, ['instance', 'templateInstance', 'get', 'set', 'getLimit', 'model', 'routeModel', 
																'componentModel', 'parentModel', 'routeData', 'componentData', 'parentData']);
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

//just store these on UltimateComponent for both UltimateComponent and UltimateComponentModel for simplicity
UltimateComponent.extendStatic({
	components: {},
	componentsByTemplateName: {}
});