UltimateModel.extendStatic({
	keep: function(limit, expireIn) {
		this._subsManager = this._subsManager || new SubsManager(limit: limit || 10, expireIn: expireIn || 5);
		return this;
	},
	clear: function() {
		if(this._subsManager) this._subsManager.clear();
		return this;
	},
	reset: function() {
		if(this._subsManager) this._subsManager.reset();
		return this;
	}
})