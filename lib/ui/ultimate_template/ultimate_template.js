UltimateTemplate = function UltimateTemplate() {};

UltimateTemplate = UltimateTemplate.extends({
	isTemplate: true,
	
	created: function() {},
	rendered: function() {},
	destroyed: function() {},

	data: Template.currentData,
	currentData: Template.currentData,
	parentData: Template.parentData,
	//instance: Template.instance //see instance_methods.js for extended usage
	
	onBeforeStartup: function() {
		var UT = this.createNew();
		
		UT.template.helpers(UT.getHelpers());

		var UE = new UltimateEvents(UT);
		UE.addEvents(UT.template, UT.getEvents());
		
		UT.template.created = function() {
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
				helpers[prop] = this[prop].bind(this);
			}
		}
		
		helpers.get = this.get.bind(this);
		return helpers;
	},
	_isHelper: function(prop) {
		this._reservedRegex = this._reservedRegex || /^(create|rendered|destroyed|click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;	
		return this.hasOwnProperty(prop) && !this._reservedRegex.test(prop) && !UltimateTemplate.prototype.hasOwnProperty(prop);
	},
	
	
	getEvents: function() {
		var events = {};
	
		for(var prop in this) {
			if(this._isEvent(prop)) {
				events[prop] = this[prop].bind(this);
			}
		}
	
		return events;
	},
	_isEvent: function() {
		this._eventsRegex = this._eventsRegex || /^(click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/;			
		return this.hasOwnProperty(prop) && this._eventsRegex.test(prop);
	},
	

	model: function() {
		if(this._model || _.isNull(this._model)) return this._model;
		
		var data = this.data();
		
		if(!data) return;
		
		this._model = null;
		
		if(this._isModel(data)) this._model = data;
		else if(this._isModel(data.model)) this._model = data.model;
		else {
			for(var prop in data) {
				if(data.hasOwnProperty(prop) && this._isModel(data[prop])) {
					this._model = data[prop];
					break;
				}
			}
		}
		
		return this._model;
	},
	_isModel: function(data) {
		if(!data.__type) return null;
		return data.__type.indexOf('model_') === 0 || data.__type.indexOf('form_') === 0;
	}
});