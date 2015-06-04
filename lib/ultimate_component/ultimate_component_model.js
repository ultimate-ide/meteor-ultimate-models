Ultimate('UltimateComponentModel').extends(UltimateComponentParent, {
	abstract: true,
	_applyBind: function(func, componentModel, curryArg) {
		if(!_.isFunction(func)) return func; 

		var uc = this;

		return function() {
			//componentModel is for use in template callbacks where there top level data context is needed
			//this == standard meteor data context, as in events and helpers, but may need to be this.model() actually
			var context = componentModel === true ? uc.componentModel() : this, 
				args = _.toArray(arguments);
				
			context.component = uc;
			
			if(curryArg) args.unshift(curryArg); //currentArg is just uc, for specific use by template callback wrappers 
			return func.apply(context, args); //defined at the top of ultimate_component_parent.js
		};
	}
});