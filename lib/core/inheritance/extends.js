var globalScope = this;
	
Function.prototype.extends = function(Parent, methods, calledFrom) {
	if(arguments.length === 1) {
		methods = Parent;
		Parent = UltimateClass;
	}
	
	//allow for: NewModel.extends(OrderModel, {}), rather than: NewModel.modelExtends(OrderModel, 'orders', {})
	if(Parent.prototype.isForm && !calledFrom) {
		return this.formExtends(Parent, methods);
	}	
	if(Parent.prototype.isModel && Parent.prototype.collection && !calledFrom) {
		return this.modelExtends(Parent, Parent.prototype.collection, methods);
	}
	if(Parent.prototype.isTemplate && Parent.name && !calledFrom) {
		return this.templateExtends(Parent, Parent.name, methods);
	}
	
	var className = this.getClassName(),
		constructor = this.prototype.constructor,
		helper = new InheritanceHelper(Parent, className, constructor),
		Class = helper.transformClass(); //some fancy stuff is done here; dig deeper if u want
		
	helper.attachPrototype(Class);
 	helper.configurePrototype();
	helper.configureStatics();
	helper.addMethods(methods);
	
	return globalScope[className] = Class; //replace the original var in the global scope, leaping over any closures
};
