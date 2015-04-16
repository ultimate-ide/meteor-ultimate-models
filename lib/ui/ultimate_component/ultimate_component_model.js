UltimateComponent = Ultimate('UltimateComponentModel').extends(UltimateComponentParent, {
	_applyBind: function(func, componentModel, curryArg) {
		var uc = this;
		
		return function() {
			var context = componentModel === true ? uc.componentModel() : this,
				args = _.toArray(arguments);
				
			context.component = uc;
			
			if(curryArg) args.unshift(curryArg);
			return func.apply(context, args);
		};
	}
});