GlobalScope = this;

UltimateHTTP.extend({
	generateMeteorMethod: function(meth) {
		var isStatic = this.isStatic,
			InstanceOrClass = this.InstanceOrClass,
			className = this.className;

		//define a method to pass to Meteor.methods()
		var method = function() {
			console.log('extendHTTP: Meteor.method', className, meth, arguments);

			var args = _.toArray(arguments),
				argsTransformed = [];

			//morph appropriate objects into instances extended from our classes
			_.each(args, function(arg) {
				if(_.isObject(arg) && arg.__type) { //is an object extended from our classes
					var instance = new GlobalScope[arg.className]('no_params');
					arg = instance.transformServer(arg);
				}
				argsTransformed.push(arg);
			});
		
			if(!isStatic) {
				var instance = argsTransformed.shift();
				instance.meteor = function() {
					return this;
				}.bind(this); //usage: instance.__meteor.unblock() mainly
				var response = instance[meth].apply(instance, argsTransformed);
			}
			else {
				this.class.meteor = function() {
					return this;
				}.bind(this); //WORRIED: static method could be unblocked by other client
				var response = this.class[meth].apply(this.class, argsTransformed);
			}

			console.log('extend HTTP response: ', response);
			return response;
		};
	
		this.addMeteorMethod(meth, method);
	},
	addMeteorMethod: function(meth, method) {
		var methodObj = {},
			methodName = this.__type + '_' + meth;
	
		methodObj[methodName] = method;
		Meteor.methods(methodObj);
	}
});