UltimateComponent = Ultimate('UltimateComponent').extends(UltimateComponentParent, {
	abstract: true,
	_applyBind: function(func) {
		return func.bind(this); 
	}
});