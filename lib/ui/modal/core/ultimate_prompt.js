UltimatePrompt = Ultimate('UltimatePrompt').extends(UltimateModalForm, {
	construct: function(id, form, options) {
		this.id = id;
	
		if(form && form.__type) {
			this._self = new UltimateModelPrompt;
			this._self.init.apply(this, arguments);
		}
		else {
			var schemaPrompt = new UltimateSchemaPrompt;
			schemaPrompt.init.apply(schemaPrompt, arguments);
			return schemaPrompt;
		}
	},


	formData: function() {
		return this._self.formData.apply(this, arguments);
	},
	submit: function() {
		return this._self.submit.apply(this, arguments);
	}
});