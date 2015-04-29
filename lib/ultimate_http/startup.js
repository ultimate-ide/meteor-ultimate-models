//GLOBALLY WIRE UP METEOR.CALL/METHOD TO RECREATE STUBS ON CLIENT
if(Meteor.isServer) {
	Meteor.methods({
		httpClasses: function() {
			return Ultimate.httpClasses;
		}
	});
}
if(Meteor.isClient) {
	Meteor.startup(function() {
		Meteor.call('httpClasses', function(error, httpClasses) {
			console.log('http_objects CALL', httpClasses);

			_.each(httpClasses, function(classObj, className) { //ITERATE THROUGH httpClasses STUBS SENT FROM SERVER

				if(!window[className]) {	//CREATE AN EMPTY CLASS IF IT DOESN'T EXIST ON THE CLIENT (+ CONSTRUCTOR)
					Ultimate(className).extends(window[classObj.parentClass], {
						construct: eval('('+classObj.construct+')')
					});
				}
				
				if(!_.isEmpty(classObj.instanceMethods)) { //ADD INSTANCE METHODS (IF ANY)
					var http = new UltimateHttp(window[className], null);
					http.addClientStubs(classObj.instanceMethods);
				}
				
				if(!_.isEmpty(classObj.staticMethods)) { //ADD STATIC METHODS (IF ANY)
					var http = new UltimateHttp(window[className], null, null, true);
					http.addClientStubs(classObj.staticMethods);
				}

        Ultimate.set('httpClassesReady', true); //CLIENT CODE CAN REACTIVELY DEPEND ON THIS PROP IN AN AUTORUN

			});
		});
	});
}