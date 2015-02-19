Modal = function Modal(id, options) {
	this.id = id;
	this.setOptions(options);
};

Modal.extends(Base, {
	show: function(callback) {
		this.render();
		this.element().modal('show');
		
		this.callback = callback;
	},
	hide: function() {
		this.element().modal('hide');	
	},
	
	setOptions: function(options) {
		this.options = this.options || {};
		_.extend(this.options, options);
	},
	
	render: function() {
		if(this.isRendered()) return;

		this._modal = Blaze.renderWithData(this.template(), this.data(), $('body')[0]);
		this.onClose();
		this.onSubmit();
	},
	remove: function() {
		Blaze.remove(this._model);
	},
	isRendered: function() {
		return this.element().length > 0;
	},
	element: function() {
		return $('#'+this.id);
	},
	
	template: function() {
		return Template.modal_popup;
	},
	data: function() {
		_.extend(this.options, {
			title: this.title,
			subtitle: this.subtitle,
			description: this.description,
			cancelText: this.cancelText || 'Cancel',
			submitText: this.submitText || 'Submit',
			noSubmit: true
		});
		
		return this.options;
	},
	
	
	onClose: function() {
		this.element().on('hidden.bs.modal', function() {
			this.remove();
		}.bind(this));
	},
	onSubmit: function() {
		this.element().find('.modalSubmit').on('click', this.submit.bind(this));
	},
	submit: function() {
		this.applyCallback();
		this.hide();
	},
	applyCallback: function() {
		var args = _.toArray(arguments),
			context = args.shift() || this;

		if(this.callback) this.callback.apply(context, args);
	},
});