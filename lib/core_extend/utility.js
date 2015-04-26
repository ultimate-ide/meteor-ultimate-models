Function.extend({
	getClassName: function() {
		if(this.className) return this.className;
	
		var name = this.toString();
		name = name.substr('function '.length);        
		return this._className = name.substr(0, name.indexOf('('));       
	}
})