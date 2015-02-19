ModalContent = function ModalContent(id, template, data, options) {
	if(arguments.length === 4) {
		this.callParentConstructor(id, options);
		this.template = template;
		this.content = content;
	}
	else { //arguments.length === 2
		options = template || 'empty_modal_content'; //map containingg template, data & standard options
		this.callParentConstructor(id, options);
	}
};

ModalContent.extends(Modal, {
	data: function() {
		var data = this.applyParent('data');
		data.currentTemplate = this.template;
		data.currentContext = this.content;
		return data;
	}
});