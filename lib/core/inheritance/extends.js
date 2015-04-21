Ultimate = function Ultimate(className) {
	Ultimate.className = className;
	return Ultimate;
};

Ultimate.classes = {};
Ultimate.collections = {};


Ultimate.extends = function(Parent, customParam, methods) {
	if(arguments.length <= 1 && !_.isFunction(Parent)) {
		methods = Parent;
		Parent = UltimateClass;
	}
	
	if(arguments.length === 2) {
		methods = customParam;
		customParam = null;
	}
	
	if(_.isEmpty(methods)) methods = {};
	
	
	console.log('CLASS START', this.className, Parent.className);
	
	var className = this.className,
		constructor = methods.construct,
		helper = new InheritanceHelper(Parent, className, constructor),
		Class = helper.transformClass(); //some fancy stuff is done here; dig deeper if u want
	
	helper.attachPrototype(Class);
 	helper.configurePrototype();
	helper.configureStatics();
	console.log('CLASS BEFORE ADD METHODS', className, Parent.className);
	
	if(Parent.is('model')) helper.setupModel(methods, customParam);
	if(Parent.is('component')) helper.setupComponent(methods, customParam);
	if(Parent.is('permissions')) helper.setupPermissions(methods, customParam);
	
	helper.addMethods(methods);
	
	console.log('CLASS COMPLETE', className, Parent.className);
		
	Class.classCreated = Class.prototype.classCreated = true;
	
	return globalScope[className] = Class; //replace the original var in the global scope, leaping over any closures
	//return eval(className + ' = ' + Class); //assign class within package scope
};