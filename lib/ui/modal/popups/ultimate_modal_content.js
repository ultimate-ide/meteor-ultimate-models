UltimateModalContent = Ultimate('UltimateModalContent').extends(UltimateModal, {
	construct: function(id, template, data, options) {
		if(arguments.length >= 3) {
			if(!_.isObject(options)) options = {};
			options.currentTemplate = template;
			options.currentContext = data;
			this.callParentConstructor(id, options);
		}
		else { //arguments.length === 2 || arguments.length == 1
			options = {};
			options.currentTemplate = options.template || 'empty_modal_content';
			this.callParentConstructor(id, options);
		}
	},


	data: function() {
		var data = this.applyParent('data');
		return data; //was doing other stuff here, but not anymore (for now)
	}
});