UltimatePrompt = function UltimatePrompt(id, form, options) {
	this.id = id;
	
	this._self = form && form.__type ? new ModelPrompt : new SchemaPrompt;
	this._self.init.apply(this, arguments);
};

UltimatePrompt.extends(ModalForm, {
	formData: function() {
		return this._self.formData.apply(this, arguments);
	},
	submit: function() {
		return this._self.submit.apply(this, arguments);
	}
});