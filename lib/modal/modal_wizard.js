ModalWizard = function ModalWizard(id, model, options) {
	var modalOptions = {};
	
	if(_.isString(options)) modalOptions.title = options;
	if(options && _.isString(options.title)) modalOptions.title = options.title;
	
	this.callParentConstructor(id+'_modal', modalOptions);
	
	this.wizardOptions = _.isObject(options) ? options : {};
	
	this.model = model;
};

ModalWizard.extends(Modal, {
	template: function() {
		return Template.modal_wizard;
	},
	data: function() {
		var data = this.applyParent('data');
		
		data.wizardData = this.wizardOptions;
		data.wizardData.id = this.id.replace('_modal', '');
		data.wizardData.model = this.model;
		data.wizardData.onComplete = this.onComplete.bind(this);
		
		return data;
	},
	onComplete: function() {
		this.setTimeout(function() {
			this.hide();
		}, 2000);
	}
});