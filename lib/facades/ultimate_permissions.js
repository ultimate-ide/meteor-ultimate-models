Ultimate('UltimatePermissions').extends(UltimateFacade, {
	abstract: true,
	isPermissions: true,
	
	allowMethods: ['update', 'insert', 'fetch', 'transform', 'allowUpdate', 'allowInsert', 'allowFetch', 'allowTransform'],
	denyMethods: ['denyUpdate', 'denyInsert', 'denyFetch', 'denyTransform'],
	
	
	onFacadeStartup: function() {
		var allowMethods = _.pickAndBind(this, this.allowMethods),
			denyMethods = _.pickAndBind(this, this.denyMethods);
				
		this.collection.allow(allowMethods);
		this.collection.deny(denyMethods);
	},

	isMethod: function(prop) {
		return this.isAllowedMethod(prop);
	}
});