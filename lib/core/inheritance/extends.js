Ultimate = function Ultimate(className) {
	Ultimate.className = className;
	return Ultimate;
};

Ultimate.extends = function(Parent, customParam, methods) {
	if(arguments.length <= 1) {
		methods = Parent;
		Parent = UltimateClass;
	}
	
	if(arguments.length === 2) {
		methods = customParam;
		customParam = null;
	}
	
	if(_.isEmpty(methods)) methods = {};
	
	if(Parent.is('model')) InheritanceHelper.setupModel(methods, customParam);
	if(Parent.is('template')) InheritanceHelper.setupTemplate(methods, customParam);
	
	
	var className = this.className,
		constructor = methods.construct,
		helper = new InheritanceHelper(Parent, className, constructor),
		Class = helper.transformClass(); //some fancy stuff is done here; dig deeper if u want
		
	helper.attachPrototype(Class);
 	helper.configurePrototype();
	helper.configureStatics();
	helper.addMethods(methods);
	
	
	if(Parent.is('model')) InheritanceHelper.assignCollectionTransform(Class);
		
	return globalScope[className] = Class; //replace the original var in the global scope, leaping over any closures
};