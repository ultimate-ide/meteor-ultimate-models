UltimateModel.extendStatic({
	keep: function() {
		this._subsManager = this._subsManager || new SubsManager(Limit: 10, expireIn: 5);
		return this;
	},
	expireIn: function(expireIn, limit) {
		this._subsManager = new SubsManager(Limit: limit, expireIn: expireIn);
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