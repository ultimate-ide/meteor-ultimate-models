UltimateModelPrompt = function UltimateModelPrompt() {};

UltimateModelPrompt = UltimateModelPrompt.extends(UltimateModalForm, {
	init: function(id, model, options) {
		this.id = id;
		this.model = model;
		this.setOptions(options);
	},
	
	formData: function() {
		var data = this.applyParent('formData');
		data.model = this.model.reactive('ultimate_model_prompt_'+this.id);
		return data;
	},
	
	submit: function() {
		var errors = this.model.validateForm(),
			values = this.model.getFormValues();
		
		_.extend(this.model, values);
		
		if(errors.length == 0) {
			if(this.callback) this.applyCallback(this.model, values);
			else this.model.callCurrentFormOnSubmit();
			this.hide();
		}
	}
});