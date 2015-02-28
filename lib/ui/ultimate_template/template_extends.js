Function.extend({
	templateExtends: function(Parent, templateName, methods, isAbstract) {
		if(arguments.length === 2) {
			methods = templateName;
			templateName = Parent;
			Parent = UltimateTemplate;
		}
		
		if(!_.isObject(methods)) methods = {};
		
		methods.name = templateName;
		methods.template = Template[templateName];
		methods.isAbstract = isAbstract;
		
		var Class = this,
			UT = Class.extends(Parent, {}, true); //add collection first so hook methods have access to it
	
		UT.prototype.__type = 'template_instance_'+UT.getClassName();
		UT.__type = 'template_class_'+UT.getClassName();
		
		UT.name = templateName;
		UT.template = Template[templateName];
		
		UT.mixinStatic(Parent);
		UT.extend(methods); //do this last so all the __type vars, etc, are set
		
		return UT;
	}
});