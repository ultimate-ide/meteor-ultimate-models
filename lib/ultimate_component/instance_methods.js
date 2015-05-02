UltimateComponentParent.extend({
	instance: function(prop, val) {
		return this._assistInstance(this._currentComponentInstance, prop, val);
	},
	templateInstance: function(prop, val) {
		return this._assistInstance(Template.instance(), prop, val);
	},
	_assistInstance: function(instance, prop, val) {
		if(!prop && !val) return instance;
		else if(prop) {
			if(_.isFunction(instance[prop])) return instance[prop].call(this);
			else return instance[prop];
		}
		else if(val) return instance[prop] = val;
	},


	parentInstance: function(levels) {
		return Template.parentInstance(levels);
	},
	
	
	$: function(selector) {
		return this.instance().$(selector);
	},
	find: function(selector) {
		return this.instance().find(selector);
	},
	findAll: function(selector) {
		return this.instance().findAll(selector);
	},
	firsNode: function() {
		return this.instance().firsNode;
	},
	lastNode: function() {
		return this.instance().lastNode;
	},
	view: function() {
		return this.instance().view;
	},
	
	
	//override methods from UltimateReactive mixin to be specific to component templates
	getReactiveDict: function() {
		return this.instance()._reactiveDict = this.instance()._reactiveDict || new ReactiveDict;
	}
});



Blaze.TemplateInstance.prototype.parentTemplate = function(levels) {
    var view = Blaze.currentView;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.substring(0, 9) === "Template." && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};

Template.parentInstance = function(levels) {
	Template.instance().parentTemplate(levels);
};