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
				if(!window[className]) {		
					var Parent = window[classObj.parentClass],
						construct = eval('('+classObj.construct+')');
					
					Ultimate(className).extends(Parent, {
						construct: construct
					});
				}
				
				var Class = window[className];
				
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