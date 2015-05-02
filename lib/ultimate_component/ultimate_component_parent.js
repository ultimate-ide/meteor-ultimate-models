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
	
  	_helperRegex: /^(onCreated|onRendered|onDestroyed|autorun|subscribe|subscribeLimit|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/,
  	_eventsRegex: /^(click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/,
	_animationsRegex: /^(insertElement|moveElement|removeElement|fadeIn|fadeOut)(\s|$)/,
	
	includes: [],
	
	onBeforeStartup: function() {
		var uc = this.createNew();
		
		uc.rememberComponent();
    	uc.emit('beforeComponentStartup'); //let UltimateDatatableComponent copy template first

    	uc.setupMixins();
		
	  	if(!uc.template) return;

    	uc.setupHelpers();
    	uc.setupEvents();
    	uc.setupCallbacks();
    	uc.setupIncludes();
		console.log("UC", uc);
	},
	
	
	rememberComponent: function() {
		UltimateComponentParent.components[this.className] = this;
		UltimateComponentParent.componentsByTemplateName[this.templateName] = this;
	},
	setupHelpers: function() {
		var helpersMap = this.getHelpers();
		this.template.helpers(helpersMap);
	},
	setupEvents: function() {
		var ue = new UltimateEvents(this.template, this);
   		ue.addEvents(this.getResolvedEvents());
	},
	setupCallbacks: function() {
		console.log('SETUP CALLBACKS RUNNING', this.className, this.template);
		var onCreated = function(uc) {
			console.log('CREATED', uc, this);
			uc.runReactiveMethods();
			
			uc._currentComponentInstance = Template.instance();
			Template.instance().className = uc.className;	
			
			uc.construct.call(this);
			
			_.callNext(uc.onCreatedCallbacks, this);
		};
	
		var onRendered = function(uc) {
			console.log('RENDERED');
			uc.setupAnimations(this);
			_.callNext(uc.onRenderedCallbacks, this);
		};
		
		var onDestroyed = function(uc) {
			_.callNext(uc.onDestroyedCallbacks, this);
			this.stop();
		};
		
		this.template.onCreated(this._applyBind(onCreated, true, this));
		this.template.onRendered(this._applyBind(onRendered, true, this));
		this.template.onDestroyed(this._applyBind(onDestroyed, true, this));
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
					else el._uihooks[hookName] = handler.bind(ctx);
				});
			}, this);
	},
	setupIncludes: function() {
		_.each(this.includes, function(name) {
			var helpersMap = this.getHelpers();
			Template[name].helpers(helpersMap);	
			
			//if component exists for template, its helpers override helpers included from other components
			var component = UltimateComponentParent.componentsByTemplateName[name];
			if(component) component.setupHelpers(); 
		}, this);
	},
	
	
	getHelpers: function() {	
		return _.chain(this.getPrototype())
			.filterPrototype(this._isHelper)
			.mapObject(this._resolveHelper, this)
			.mapObject(this._applyBind, this)
			.extend(this._getSpecialHelpers())
			.value();
	},
	_isHelper: function(method, prop) {
		return !this._helperRegex.test(prop) && this.isMethod(prop) && this._isFunction(prop);
	},
	_isFunction: function(prop) {
		return _.isFunction(this[prop]) || (_.isArray(this[prop]) && this[prop].length > 0); 
	},
	_resolveHelper: function(method, prop) {
		if(_.isArray(method) || _.isString(method)) return this._helperShortcut(prop);
		else return function() {
			return method.apply(this, arguments);
		};
	},
	_getSpecialHelpers: function() {
		return _.pickAndBind(this, ['instance', 'templateInstance', 'get', 'set', 'getLimit', 'model', 'routeModel', 
									'componentModel', 'parentModel', 'routeData', 'componentData', 'parentData']);
	},
	
	getResolvedEvents: function() {
		return this._resolvedEvents;
	},
	getEvents: function() {
		return _.filterPrototype(this.getPrototype(), this._isEvent);
	},
	_isEvent: function(method, prop) {
		return this._eventsRegex.test(prop) && this.isMethod(prop);
	},


	getAnimations: function() {
		return _.filterPrototype(this.getPrototype(), this._isAnimation);
	},
	_isAnimation: function(event, prop) {
		return this._animationsRegex.test(prop) && this.isMethod(prop);
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


	isMethod: function(prop) {
		return !this.isPrivateMethod(prop) && !this._isBaseMethod(prop);
	},
	_isBaseMethod: function(prop) {
		return UltimateComponentParent.prototype.hasOwnProperty(prop)
			|| UltimateComponent.prototype.hasOwnProperty(prop)
			|| UltimateComponentModel.prototype.hasOwnProperty(prop)
			|| UltimateClass.prototype.hasOwnProperty(prop)
			|| UltimateReactive.prototype.hasOwnProperty(prop);
	}
}, {
  components: {},
  componentsByTemplateName: {}
});