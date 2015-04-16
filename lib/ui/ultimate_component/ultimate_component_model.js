UltimateComponent = Ultimate('UltimateComponentModel').extends(UltimateComponentParent, {
	_applyBind: function(func, componentModel, curryArg) {
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