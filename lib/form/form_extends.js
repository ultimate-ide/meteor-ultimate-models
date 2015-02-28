Function.extend({
	formExtends: function(Parent, methods, isAbstract) {
		if(arguments.length === 1) {
			methods = Parent;
			Parent = UltimateForm;
		}
	
		var Class = this,
			formModel = Class.extends(Parent, {}, true); //add collection first so hook methods have access to it
	
		formModel.__type = 'form_class_'+formModel.getClassName();
		formModel.prototype.__type = 'form_instance_'+formModel.getClassName();

		methods.isAbstract = isAbstract;
		
		formModel.mixinStatic(Parent);
		formModel.extend(methods);
		
		return formModel;
	}
});