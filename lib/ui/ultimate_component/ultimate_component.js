UltimateComponent = Ultimate('UltimateComponent').extends({
	isTemplate: true,
	template: null,
	templateName: null,
	
	created: function() {},
	rendered: function() {},
	destroyed: function() {},

	mixin: [],
	mixinHelpers: [],
	mixinEvents: [],
	mixinCallbacks: [],
	
	
	onChildClassStartup: function() {
		var UT = this.createNew();
		
		UT.setupMixins();
		UT.setupHelpers();
		UT.setupEvents();
		UT.setupCallbacks();
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
		var subscribe = this._getSubscribe(this),
			subscribeLimit = this._getSubscribeLimit(this),
			autorun = this._getAutorun(this);
		
		this.template.created = function() {
			if(subscribeLimit) subscribeLimit();
			if(subscribe) subscribe();
			if(autorun) autorun();
			
			this.construct.call(this);
			this.created.call(this);
		}.bind(this);
	
		this.template.rendered = this.rendered.bind(this);	
		this.template.destroyed = this.destroyed.bind(this);
	},
	
	
	getHelpers: function() {
		var helpers = {};
		
		for(var prop in this) {
			if(this._isHelper(prop)) {
				helpers[prop] = _.isFunction(this[prop]) ? this[prop].bind(this) : this[prop];
			}
		}
		
		helpers.get = this.get.bind(this);
		return helpers;
	},
	_isHelper: function(prop) {
		this._reservedRegex = this._reservedRegex || /^(create|rendered|destroyed|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;	
		return this.___proto.hasOwnProperty(prop) && !this._reservedRegex.test(prop) && !UltimateTemplate.prototype.hasOwnProperty(prop);
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
		return this.___proto.hasOwnProperty(prop) && this._eventsRegex.test(prop);
	}
});

globalScope.UltimateTemplate = UltimateComponent; //temporary. remove when name is changed