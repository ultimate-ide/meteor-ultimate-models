Function.extend({
	formExtends: function(Parent, methods, isAbstract) {
		//if(arguments.length === 1) {
		//	methods = Parent;
		//	Parent = UltimateForm;
		//}
	
		//if(!_.isObject(methods)) methods = {};

		var Class = this,
		formModel = Class.extends(Parent, methods); 


		return formModel;
	}
});