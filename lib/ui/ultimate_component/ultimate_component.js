UltimateComponent = Ultimate('UltimateComponent').extends(UltimateComponentParent, {
	abstract: true,
	_applyBind: function(func) {
		return func.bind(this); 
	}
});

//just store these on UltimateComponent for both UltimateComponent and UltimateComponentModel for simplicity
UltimateComponent.extendStatic({
	components: {},
	componentsByTemplateName: {}
});