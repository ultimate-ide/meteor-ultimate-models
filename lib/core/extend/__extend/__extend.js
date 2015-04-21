Function.prototype.__extend = function(proto, methods) {
	if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors
	
	var extendedProto = _.extend.apply(_, arguments), //even non ultimate functions can be extended, but no magic below happens for them
		setup = new Setup(proto, methods);
	
	if(proto.isUltimate) { //an Ultimate class's statics or Ultimate prototype is being extended.
		if(methods.mixins) setup.mixins();
		if(methods.onStartup) setup.addOnStartup();
	}
	
	if(proto.isUltimatePrototype) { //only for extending Ultimate prototypes
		if(proto.isChildOf('UltimateForm')) {
			var setupForm = new SetupForm(proto, methods);
		
			if(methods.schema) setupForm.schema();
			if(methods.defineErrorMessages) setupForm.defineErrorMessages();
			if(methods.forms) setupForm.forms();
		}
	
		if(proto.isChildOf('UltimateModel')) {
			var setupModel = new SetupModel(proto, methods);
			setupModel.hooks();
			
			//make sure hooks from possible parent models are added too 
			if(!proto.classCreated) {
				var setupModel = new SetupModel(proto, proto.parent); 
				setupModel.hooks();
			}
		}
	
		//Run after all methods are attached to proto above so they have access to those methods, 
		//but they will only have access to methods defined in initial .extends({}) map argument
		if(!proto.classCreated) {
			setup.onBeforeStartup();
			setup.onStartup();
		}
	}
	return extendedProto;
};