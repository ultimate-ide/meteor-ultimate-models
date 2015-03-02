UltimateTemplate.extend({
	data: function(prop) {
		return this.currentData(prop);
	},
	currentData: function(prop) {
		var data = Template.currentData() || this.templateData();
		return this._prepData(data, prop);
	},
	templateData: function(prop) {
		var data = this.instance().data  || this.routeData();
		return this._prepData(data, prop);
	},
	routeData: function(prop) {
		var data = Router.current().data;
		return this._prepData(data, prop);
	},
	parentData: function(level, prop) {
		var data = Template.parentData(level);
		return this._prepData(data, prop);
	},

	
	model: function(prop, data) {
		data = data || this.data();
		
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
		
		return this._prepData(this._model, prop);
	},
	currentModel: function(prop) {
		return this.model(prop, this.currentData());
	},
	templateModel: function(prop) {
		return this.model(prop, this.templateData());
	},
	routeModel: function(prop) {
		return this.model(prop, this.routeData());
	},
	parentModel: function(levels, prop) {
		return this.model(prop, this.parentData(levels));
	},
	
	
	_isModel: function(data) {
		if(!data.__type) return null;
		return data.__type.indexOf('model_') === 0 || data.__type.indexOf('form_') === 0;
	},
	_prepData: function(data, prop) {
		if(prop) return _.isObject(data) ? data[prop] : null;
		else return data;
	}
});