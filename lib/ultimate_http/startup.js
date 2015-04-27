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
					Ultimate(className).extends(window[classObj.parentClass], {
						construct: eval('('+classObj.construct+')')
					});
				}
				
				if(!_.isEmpty(classObj.instanceMethods)) {
					var http = new UltimateHTTP(window[className], null);
					http.addClientStubs(classObj.instanceMethods);
				}
				
				if(!_.isEmpty(classObj.staticMethods)) {
					var http = new UltimateHTTP(window[className], null, null, true);
					http.addClientStubs(classObj.staticMethods);
				}
			});
		});
	});
}