UltimateWizard = Ultimate('UltimateWizard').extends({
	construct: function(template) {
	  this._dep = new Tracker.Dependency();
	  this.template = template;
  
		template.data = template.data || true;
	
	  _.extend(this, _.pick(template.data, ['id', 'steps', 'clearOnDestroy', 'model', 'onComplete', 'route', 'noRoute']));

		if(!this.noRoute) this.route = this.route || Router.current().route.getName();
	
		var model = this.model;
		this.steps = this.steps || (_.isFunction(model.wizards) ? model.wizards()[this.id] : model.wizards[this.id]);
	
	  this._stepsByIndex = [];
	  this._stepsById = {};
	
	  this.initialize();
	},

  initialize: function() {
    var self = this;
    
		this.totalSteps = this.steps.length;
		this.lastStepIndex = this.totalSteps - 1;
		this.stepsCompleted = 0;
		
    _.each(this.steps, function(step, index) {
      self._initStep(step, index);
    });
    
    Tracker.autorun(function() {
      self._setActiveStep();
    });
		
		Tracker.autorun(function() {
			var step = self.activeStep();
			if(!step.form) return;
			
			self.model.showFlashMessages();
		});
  },

  clearData: function() {
		if(this.model) this.model.removeLocal();
  },
	
  _initStep: function(step, index) {
    var self = this;
    
		step.id = step.path;
		
    if(!step.id) {
      throw new Error('Step.id is required');
    }
    
    this._stepsByIndex.push(step.id);

    this._stepsById[step.id] = _.extend(step, {
			index: index,
      wizard: self,
			schema: step.form ? this.model.getFormSchema(step.form) : null,
			onSubmit: step.onSubmit || (step.form ? this.model.getFormOnSubmit(step.form) : null)
    });

		if(step.defaultData) this.setData(step.defaultData);
		
    AutoForm.addHooks([step.form], {
			onError: function(operation, error, template) {
				Flash.danger(error.message);
			},
      onSubmit: function(data) {
				self.setData(data);			
				self.onNext(this);
				
        return false;
      }
    }, true);
  },
  
	onNext: function(autoform) {
		var step = this.activeStep(),
			model = this.model,
			schemaFields = step.schema ? step.schema._schemaKeys : [],
			autoform = this.getAutoformArgument(autoform);

		function onSubmit() {
			if(step.onSubmit) step.onSubmit.apply(model, [autoform, this]);
			else if(step.onComplete) step.onComplete.apply(model, [autoform, this]);
			else autoform.done(null, model);
		}
	
		model.__applyOnSubmit(onSubmit.bind(this), model, autoform, schemaFields);
	},
	getAutoformArgument: function(autoform) {
		var self = this;
		
		if(autoform && !autoform.__modified) {
			var oldDone = autoform.done;
			autoform.__modified = true; //so that self.next() isn't called multiple times if we keep wraping the done() function
			
			autoform.done = function(error, result) {
				oldDone.apply(autoform, arguments);
				if(!error) {
					self.next();
				}
			};
		}
		else if(!autoform) {
			autoform = {};
			autoform.done = function(error, result) {
				if(!error) {
					self.next();
					if(self.stepsCompleted === self.totalSteps) self.complete();
				}
			};
		};
		
		return autoform;
	},
	
	NEXT: function(data) {
		var step = this.activeStep(),
		data = data || {};
		
		if(step.form) {
			var formData = AutoForm.getFormValues(step.form).insertDoc;
			data = _.extend({}, formData, data);
		}

		this.setData(data);

		var $form = $('#'+this.id+' form');
		
		if($form.length > 0) $form.submit();
		else this.onNext();
	},
	PREV: function(data) {
		var step = this.activeStep(),
		data = data || {};
		
		if(step.form) {
			var formData = AutoForm.getFormValues(step.form).insertDoc;
			data = _.extend({}, formData, data);
		}
		this.setData(data);
		
		this.previous();
	},
	
  next: function(data) {	
		var index = this.getActiveIndex() + 1;
		this.stepsCompleted = index;
		this.show(index);
  },
  previous: function() {
    this.show(this.getActiveIndex() - 1);
  },
	
	complete: function() {
		if(this.onComplete) this.onComplete.call(this);
	},
	
	
	get: function(prop) {
		return this.model.get(prop);
	},
	
  setData: function(data) {		
		return this._set(data);
  },
	set: function(key, val) {
		var data = {};
		data[key] = val;
		
		return this._set(data);
	},
	_set: function(data) {
		_.extend(this.model, data); //extend complete model;	
		this.model.save();
		
		return this.model;
	},
	
	
  _setActiveStep: function() {
    if(!this.route) return this.show(0); //show the first step if not bound to a route

    var current = Router.current();
    
    if(!current || (current && current.route.getName() != this.route)) return false;
    
    var params = current.params, 
			index = _.indexOf(this._stepsByIndex, params.step);

    if(!params.step || index === -1) return this.show(0); //initial route or non existing step, redirect to first step

    this.setStep(params.step);
  },
	
  show: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }
    
    if(!id) return false;
		
    if(this.route) Router.go(this.route, {step: id});
		else this.setStep(id);
    
    return true;
  },
	
  setStep: function(id) {
		var index = _.indexOf(this._stepsByIndex, id),
			stepCompletedId = this._stepsByIndex[this.stepsCompleted];
			
		if(index > this.stepsCompleted) return this.setStep(stepCompletedId); //invalid step (user skipping ahead in the form via URL)
		
    this._activeStepId = id;
		
		this.model.setCurrentForm(this.getStep(id).form);
		if(this.lastStepIndex === this.indexOf(id)) this.clearData();
		
		this._dep.changed();
		
    return this._stepsById[this._activeStepId];
  },
	
  
  getStep: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }
    
    return id in this._stepsById && this._stepsById[id];
  },
  
  activeStep: function(reactive) {
    if(reactive !== false) this._dep.depend();
    return this._stepsById[this._activeStepId];
  },
  
	activeData: function() {
		return this.activeStep().model;
	},
	
	getActiveIndex: function() {
		return _.indexOf(this._stepsByIndex, this._activeStepId);
	},
	
  indexOf: function(id) {
    return _.indexOf(this._stepsByIndex, id);
  },
  
  destroy: function() {
    if(this.clearOnDestroy) this.clearData();
  } 
});