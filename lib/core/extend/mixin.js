Function.extend({
	mixin: function(Parent) { 
		this.mixinStatic(Parent);
		this.mixinInstance(Parent);
	},
	mixinStatic: function(Parent) { 
		UltimateClone.deepExtendOwn(this, Parent, function(prop) {
			return !InheritanceHelper.usesReservedWord(prop);
		});
	},
	mixinInstance: function(Parent) { 
		UltimateClone.deepExtendPrototypeOwn(this, Parent, function(prop) {
			return !InheritanceHelper.usesReservedWord(prop);
		});
	}
});