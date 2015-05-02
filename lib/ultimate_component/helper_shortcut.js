UltimateComponentParent.extend({
	_helperShortcut: function(prop) {
		var arr = [].concat(_.clone(this[prop])), //so a string can also be provided
			parts = arr[0].split('.'), //eg: 'model.isActive'
			obj = parts[0],
			methodParts = parts[1].split(' '),
			method = methodParts.shift(),
			params = methodParts;
		
			if(!method) {
				method = obj;
				obj = 'model';
			}
			else if(obj == 'get') {
				obj = 'instance';
				params = method;
				method = 'get';
			}
			
			if(arr.length == 1) return this._method(obj, method, params);
			else if(arr.length == 2 && _.isObject(arr[1])) return this._switch(obj, method, params, arr[1]);
			else if(arr.length == 2 && _.isArray(arr[1])) return this._switchBoolean(obj, method, params, arr[1], arr[2]);
			else return this._ternary(obj, method, params, arr[1], arr[2]);
	},
	_method: function(obj, method, params) {
		return function() {
			var finalObj = this[obj]();
			return finalObj[method].apply(finalObj, params);// this.model().method([params])
		}.bind(this);
	},
	_switch: function(obj, method, params, switchObject) {
		return function() {
			var finalObj = this[obj](),
				response = finalObj[method].apply(finalObj, params); //eg: 'stopped'
			
			return _.find(switchObject, function(v, k) {
				if(response == k) return v; //eg: return 'danger'
				else if(k == 'default') return v; //eg: return 'warning'
			});
		}.bind(this);
	},
	_switchBoolean: function(obj, method, params, switchArr, trueFalse) {
		return function() {
			var finalObj = this[obj](),
				response = finalObj[method].apply(finalObj, params); //eg: 'stopped'
			
			//eg: switchArr values === true: showActionButton: ['model.status', ['running', 'terminated']]
			//eg: switchArr values === false: showActionButton: ['model.status', ['running', 'terminated'], false]
			return _.find(switchArr, function(v) {
				if(response == v) return trueFalse === false ? false : true;  
				else return trueFalse === false ? true : false; 
			});
		}.bind(this);
	},
	_ternary: function(obj, method, params, trueResponse, falseResponse) {
		return function() {
			var finalObj = this[obj]();
			finalObj[method].apply(finalObj, params) ? trueResponse : (falseResponse || ''); //eg: this.model().isActive() ? 'active' : 'inactive'
		}.bind(this);
	}
});