UltimateTemplate = Ultimate('UltimateTemplate').extends({
	isTemplate: true,
	template: null,
	templateName: null,
	
	created: function() {},
	rendered: function() {},
	destroyed: function() {},

	
	onChildClassStartup: function() {
		var UT = this.createNew();
		
		this.setupCallbacks(UT);
		
		UT.template.helpers(UT.getHelpers());

		var UE = new UltimateEvents(UT.template, UT);
		UE.addEvents(UT.getEvents());	
	},
	
	
	setupCallbacks: function(UT) {
		var subscribe = this._getSubscribe(UT),
			subscribeLimit = this._getSubscribeLimit(UT),
			autorun = this._getAutorun(UT);
		
		UT.template.created = function() {
			if(subscribeLimit) subscribeLimit();
			if(subscribe) subscribe();
			if(autorun) autorun();
			
			UT.construct.call(UT);
			UT.created.call(UT);
		};
	
		UT.template.rendered = UT.rendered.bind(UT);	
		UT.template.destroyed = UT.destroyed.bind(UT);
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