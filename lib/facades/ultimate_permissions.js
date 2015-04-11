Ultimate('UltimatePermissions').extends(UltimateFacade, {
	isPermissions: true,
	
	allowMethods: ['update', 'insert', 'fetch', 'transform', 'allowUpdate', 'allowInsert', 'allowFetch', 'allowTransform'],
	denyMethods: ['denyUpdate', 'denyInsert', 'denyFetch', 'denyTransform'],
	
	
	onStart: function(self) {
		var allowMethods = _.pickAndBind(self, self.allowMethods),
			denyMethods = _.pickAndBind(self, self.denyMethods);
				
		this.collection.allow(allowMethods);
		this.collection.deny(denyMethods);
	},

	isMethod: function(prop) {
		return this.isAllowedMethod(prop);
	}
});