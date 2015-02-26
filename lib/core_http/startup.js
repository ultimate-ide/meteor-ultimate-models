//GLOBALLY WIRE UP METEOR.CALL/METHOD TO RECREATE STUBS ON CLIENT
if(Meteor.isServer) {
	Meteor.methods({
		http_objects: function() {
			return UltimateHTTP.clientClasses;
		}
	});
}
if(Meteor.isClient) {
	Meteor.startup(function() {
		Meteor.call('http_objects', function(error, clientClasses) {
			console.log('http_objects CALL', clientClasses);
			_.each(clientClasses, function(classObj, className) {
				
				var Class = window[className];
				
				if(!Class) {
					var constructor = classObj.construct,
						parensIndex = constructor.indexOf('('), //guarantee we have a named function
					
					constructor = constructor.substr(parensIndex); //eg: (arg, arg) { }
					var toBeEvaled = 'window['+className+'] = function '+className + constructor;
					console.log("EVAL", toBeEvaled)
					eval(toBeEvaled);
					
					Class = window[className];
					
					Class.extends(window[classObj.parentClass], {});
				}
				
				if(!classObj.isStatic) {
					var http = new UltimateHTTP(Class, null);
					http.addClientStubs(classObj.instanceMethods);
				}
				else {
					var baseHttp = new UltimateHTTP(Class, null, null, true);
					http.addClientStubs(classObj.staticMethods);
				}
			});
		});
	});
}