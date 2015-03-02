Function.extend({
	templateExtends: function(Parent, templateName, methods, isAbstract) {
		//if(arguments.length === 2) {
		//	methods = templateName;
		//	templateName = Parent;
		//	Parent = UltimateTemplate;
		//}
		
		//if(!_.isObject(methods)) methods = {};
		
		methods.templateName = templateName;
		methods.template = Template[templateName];
		//methods.__type = 'template_instance_'+this.getClassName();
		
		var Class = this,
			UT = Class.extends(Parent, methods, true); //add collection first so hook methods have access to it
	
		//UT.prototype.__type = 'template_instance_'+UT.getClassName(); //set again cuz it's overwritten in Class.extends
		//UT.__type = 'template_class_'+UT.getClassName();
		
		//UT.templateName = templateName;
		//UT.template = Template[templateName];

		
		return UT;
	}
});