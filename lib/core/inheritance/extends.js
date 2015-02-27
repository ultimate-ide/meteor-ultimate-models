var globalScope = this;
	
Function.prototype.extends = function(Parent, methods) {
	if(arguments.length === 1) {
		methods = Parent;
		Parent = UltimateClass;
	}
	
	var className = this.getClassName(),
		constructor = this.prototype.constructor,
		helper = new InheritanceHelper(Parent, className, constructor),
		Class = helper.transformClass(); //some fancy stuff is done here; dig deeper if u want
		
	helper.attachPrototype(Class);
 	helper.configurePrototype();
	helper.addMethods(methods);
	helper.configureStatics();
	
	return globalScope[className] = Class; //replace the original var in the global scope, leaping over any closures
};
