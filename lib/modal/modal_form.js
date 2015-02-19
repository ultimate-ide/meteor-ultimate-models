ModalForm = function ModalForm() {};

ModalForm.extends(Modal, {
	data: function() {
		var data = this.applyParent('data');
		data.formData = this.formData();
		return data;
	},
	formData: function() {
		return {
			id: this.id,
			validation: 'blur',
			class: 'form-horizontal mt-sm'
		};
	}
});