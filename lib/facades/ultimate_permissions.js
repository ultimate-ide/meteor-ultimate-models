Ultimate('UltimatePermissions').extends(UltimateBind, {
	allow: {},
	deny: {},	
	
	allowedMethods: ['allow', 'update', 'insert', 'fetch', 'transform'],
	isPermissions: true,
	
	
	onStart: function(self) {
		var allowMethods = self.getMethods('allow'),
			denyMethods = self.getMethods('deny');
		
		this.collection.allow(allowMethods);
		this.collection.deny(denyMethods);
	},

	isMethod: function(prop) {
		return this.isAllowedMethod(prop);
	}
});