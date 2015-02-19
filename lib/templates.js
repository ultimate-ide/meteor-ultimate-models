Template.ccExpGroup.helpers({
	monthData: function() {		
		var context = {};
		
		context.name = this.month || 'expiration_month';
		if(this.montyType) context.type = this.monthType;
		if(this.monthOptions) context.options = this.monthOptions;
		if(this.monthClass) context.class = this.monthClass;
		if(this.monthStyle) context.style = this.monthStyle;
		context.firstOption = 'Select Month';
		
		return context;
	},
	yearData: function() {		
		var context = {};
		
		context.name = this.year || 'expiration_year';
		if(this.yearType) context.type = this.yearType;
		context.options = 'allowed';
		if(this.yearClass) context.class = this.yearClass;
		if(this.yearStyle) context.style = this.yearStyle;
		context.firstOption = 'Year';
		
		return context;
	}
})

Template.formGroup.created = function() {
	this.help = this.data.help;
	delete this.data.help;
	
	this.addon = this.data.addon;
	delete this.data.addon;
};

Template.formGroup.helpers({
	label: function(label) {
		console.log('label', label);
	},
	help: function() {
		return Template.instance().help;
	},
	addon: function() {
		return Template.instance().addon;
	}
});



Template.ultimateForm.created = function() {
	this.data.model.setCurrentForm(this.data.id);

	this.autorun(function() {
		this.data.model.showFlashMessages();
	}.bind(this));
};

Template.ultimateForm.helpers({
	newData: function() {		
		var context = {};
		_.extend(context, this);
		
		if(this.model) {
			this.model.className = this.model.className; //tack it on object from proto to reinstantiate later when stripped from proto chain
			context.schema = this.model.getFormSchema(this.id);
			context.doc = this.model;
			delete context.model;
		}
		//else this.schema is used (and this.doc if provided)
		
		delete context.placeholders;
		context.class = this.class ? this.class+' ultimate-form' : 'ultimate-form';
		
		return context;
	},
	fullContext: function() {
		console.log(0, Template.parentData(0), Template.parentData(0).placeholders);
		console.log(1, Template.parentData(1), Template.parentData(1).placeholders);
		console.log(2, Template.parentData(2), Template.parentData(2).placeholders);
		console.log(3, Template.parentData(3), Template.parentData(3).placeholders);
		console.log(4, Template.parentData(4), Template.parentData(4).placeholders);
		console.log(5, Template.parentData(5), Template.parentData(5).placeholders);
		
		var placeholders = Template.parentData(2).placeholders;
		if(placeholders[this.name]) this.placeholder = placeholders[this.name];
		return this;
	},
	inputTemplate: function() {
		var inputTemplate = Template.parentData(4).inputTemplate;
		return Template[inputTemplate] || Template.formGroup;
	}
});

Template.ultimateForm.events({
	'blur [data-schema-key]': function(e, t) {
		var field = $(e.currentTarget).attr('data-schema-key'),
			value = $(e.currentTarget).val(),
			model = Template.currentData().model,
			asyncFunc = model.___customAsyncs ? model.___customAsyncs[field] : null;
			
		if(asyncFunc) {
			model[field] = value;
			
			asyncFunc.call(model, function(errorType) {
				if(errorType) {
					errorType = model.prepareErrorType(errorType);
					model.addInvalidKey({name: field, type: errorType});
				}
			});
		}
	}
});

Template.wizardSteps.helpers({
  stepClass: function(id) {
    var activeStep = this.wizard.activeStep(),
			step  = this.wizard.getStep(id);
		
    if(activeStep && activeStep.id === step.id) return 'active ';
    if(step.completed) return 'completed ';
    return 'disabled ';
  }
});

Template.wizardSteps.events({
  'click .step-link': function(e) {
		e.preventDefault();
  	if(!this.wizard.route) this.wizard.show(this.id);
  }
});


Template.instance_wizard_back_next.helpers({
  showPrevious: function() {
		var wizard = this.wizard,
			index = wizard.activeStep().index,
			lastStepIndex = wizard.lastStepIndex;
			
    return index != 0 && index != lastStepIndex;
  },
  showNext: function() {
		var wizard = this.wizard,
			index = wizard.activeStep().index,
			lastStepIndex = wizard.lastStepIndex;
			
    return index <= lastStepIndex - 2;
  },
  showFinish: function() {
		var wizard = this.wizard,
			index = wizard.activeStep().index,
			lastStepIndex = wizard.lastStepIndex;
			
    return index === lastStepIndex - 1;
  }
});

Template.instance_wizard_back_next.events({
  "click .previous > a": function(e) {
		e.preventDefault();
		
		console.log('BACK', this, this.wizard);
    this.wizard.PREV();
  },
  "click .next > a, click .finish > a": function(e) {
		e.preventDefault();
		
		console.log('NEXT', this, this.wizard);
		
		this.wizard.NEXT();
  }
});

