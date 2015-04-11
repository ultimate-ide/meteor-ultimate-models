Function.prototype.__extend = function(proto, methods) {
	if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors
	
	var extendedProto = _.extend.apply(_, arguments),
	setup = new Setup(proto, methods);
	
	if(methods.mixins) setup.mixins();
	
	if(proto.isForm) {
		if(methods.schema) setup.schema();
		if(methods.defineErrorMessages) setup.defineErrorMessages();
		if(methods.forms) setup.forms();
	}
	
	if(proto.isModel) {
		var setupHook = new SetupHook(proto, methods);
		
		setupHook.onBeforeInsert();
		setupHook.onBeforeUpdate();
		setupHook.onBeforeRemove();
		setupHook.onAfterInsert();
		setupHook.onAfterUpdate();
		setupHook.onAfterRemove();
		setupHook.onAfterFindOne();
		setupHook.onBeforeFind();
		setupHook.onAfterFind();
		setupHook.onBeforeFindOne();
		
		setupHook.validate();
	}
	
	//these should run after all methods are attached to prototype above so they have access to those methods
	if(methods.onBeforeStartup) setup.onBeforeStartup(); 
	if(proto.onChildClassBeforeStartup) setup.onChildClassBeforeStartup();
	if(proto.onChildClassStartup) setup.onChildClassStartup();	
		
	if(methods.onStartup) setup.onStartup();
	
	return extendedProto;
};