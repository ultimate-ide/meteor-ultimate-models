Ultimate('UltimateBehavior').extends({
	construct: function(doc, composer) {
		if(doc) _.extend(this, doc);
		this._composer = composer;
	},
	composer: function() {
		return this._composer;
	}
});