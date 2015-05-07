UltimateComponentModel = Ultimate('UltimateComponentModel').extends(UltimateComponentParent, {
	abstract: true,
	_applyBind: function(func, componentModel, curryArg) {
		if(!_.isFunction(func)) return func; 

		var uc = this;

		return function() {//componentModel is for use in template callbacks where there top level data context is needed
			var context = componentModel === true ? uc.componentModel() : this, //this == standard meteor data context
				args = _.toArray(arguments);
				
			context.component = uc;
			
			if(curryArg) args.unshift(curryArg);
			return func.apply(context, args);
		};
	}
});