Ultimate('UltimateComponent').extends(UltimateComponentParent, {
	abstract: true,
	_applyBind: function(func) {
		if(_.isFunction(func)) return func.bind(this); 
		else return func;
	}
});