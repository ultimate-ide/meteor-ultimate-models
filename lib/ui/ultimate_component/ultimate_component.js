UltimateComponent = Ultimate('UltimateComponent').extends(UltimateComponentParent, {
	_applyBind: function(func) {
		return func.bind(this); 
	}
});