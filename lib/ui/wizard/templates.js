UltimateWizards = {};

Template.ultimate_wizard.created = function() {
  var id = this.data.id || '_defaultId';
  UltimateWizards[id] = UltimateWizards[id] || new UltimateWizard(this);
	this.wizard = UltimateWizards[id];
};

Template.ultimate_wizard.destroyed = function() {
  var id = this.data.id || '_defaultId';

  if(UltimateWizards[id]) {
    UltimateWizards[id].destroy();
    delete UltimateWizards[id];
  }
};

Template.ultimate_wizard.helpers({
  innerContext: function(outerContext) {
    var wizard = UltimateWizards[this.id], 
			activeStep = wizard.activeStep();

    var innerContext = {
			step:  activeStep,
      model: wizard.model.reactive('ultimate_wizard_'+this.id),
      wizard: wizard,
      stepsTemplate: this.stepsTemplate || 'ultimate_wizard_steps',
			backNextTemplate: this.backNextTemplate || 'ultimate_wizard_back_next'
    };

    _.extend(innerContext, outerContext);
    return innerContext;
  },
	innerStepContext: function(outerContext) {
		//return this.wizard.model;
		return {
			model: this.wizard.model,
			wizard: this.wizard
		};
	},
	formContext: function(context) {
		//return this.model;
		_.extend(this, context);
		return this;
	},
  activeStepTemplate: function(ga) {
    var activeStep = this.wizard.activeStep();
    return activeStep && activeStep.template || null;
  }
});


Template.ultimate_wizard_steps.helpers({
  stepClass: function(id) {
    var activeStep = this.wizard.activeStep(),
			step  = this.wizard.getStep(id);
		
    if(activeStep && activeStep.id === step.id) return 'active ';
    if(step.completed) return 'completed ';
    return 'disabled ';
  }
});

Template.ultimate_wizard_steps.events({
  'click .step-link': function(e) {
		e.preventDefault();
  	if(!this.wizard.route) this.wizard.show(this.id);
  }
});


Template.ultimate_wizard_back_next.helpers({
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

Template.ultimate_wizard_back_next.events({
  "click .previous > a": function(e) {
		e.preventDefault();
    this.wizard.PREV();
  },
  "click .next > a, click .finish > a": function(e) {
		e.preventDefault();
		this.wizard.NEXT();
  }
});

