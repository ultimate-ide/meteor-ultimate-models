_.extend(Array.prototype, {
	removeAtIndex: function(index, returnRemoved) {
	   var removed = this.splice(index,1);
		 return returnRemoved ? removed : this;
	}
});