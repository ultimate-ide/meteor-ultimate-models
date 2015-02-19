ModelPrompt = function ModelPrompt() {};

ModelPrompt.extends(ModalForm, {
	init: function(id, model, options) {
		this.model = model;
		this.setOptions(options);
	},
	
	formData: function() {
		var data = this.applyParent('formData');
		data.model = this.model;
		return data;
	},
	
	submit: function() {
		var errors = this.model.validateForm(),
			values = this.model.getFormValues();
		
		if(errors.length == 0) {
			if(this.callback) this.applyCallback(this.model, values);
			else this.model.callCurrentFormOnSubmit();
			this.hide();
		}
	}
});