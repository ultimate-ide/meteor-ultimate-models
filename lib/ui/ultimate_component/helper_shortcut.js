UltimateComponent.extend({
	_helperShortcut: function(prop) {
		var arr = _.clone(this[prop]),
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
			else return this._ternary(obj, method, params, arr[1], arr[2]));
	},
	_method: function(obj, method, params) {
		return function() {
			var obj = this[obj]();
			return obj[method].apply(obj, params);// this.model().method([params])
		};
	},
	_switch: function(obj, method, params, switchObject) {
		return function() {
			var obj = this[obj](),
				response = obj[method].apply(obj, params); //eg: 'stopped'
			
			return _.find(switchObject, function(v, k) {
				if(response == k) return v; //eg: return 'danger'
				else if(k == 'default') return v; //eg: return 'warning'
			});
		};
	},
	_ternary: function(obj, method, params, trueResponse, falseResponse) {
		return function() {
			var obj = this[obj]();
			obj[method].apply(obj, params) ? trueResponse : (falseResponse || ''); //eg: this.model().isActive() ? 'active' : 'inactive'
		};
	}
});