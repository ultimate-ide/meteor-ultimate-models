Function.extend({
	mixin: function(Parent) { 
		this.mixinStatic(Parent);
		this.mixinInstance(Parent);
	},
	mixinStatic: function(Parent) { 
		UltimateClone.deepExtendUltimate(this, Parent);
	},
	mixinInstance: function(Parent) { 
		UltimateClone.deepExtendUltimate(this.prototype, Parent.prototype);
	}
});