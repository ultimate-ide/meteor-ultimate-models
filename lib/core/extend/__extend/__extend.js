Function.prototype.__extend = function(proto, methods) {
	if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors
	
	var setup = new Setup(proto, methods),
		extendedProto = _.extend.apply(_, arguments);
	
	if(proto.isForm) {
		if(methods.schema) setup.schema();
		if(methods.defineErrorMessages) setup.defineErrorMessages();
		if(methods.forms) setup.forms();
	}
	
	if(proto.isModel) {
		var setupHook = new SetupHook(proto, methods);
		
		if(methods.onBeforeInsert) setupHook.onBeforeInsert();
		if(methods.onBeforeUpdate) setupHook.onBeforeUpdate();
		if(methods.onBeforeRemove) setupHook.onBeforeRemove();
		if(methods.onAfterInsert) setupHook.onAfterInsert();
		if(methods.onAfterUpdate) setupHook.onAfterUpdate();
		if(methods.onAfterRemove) setupHook.onAfterRemove();
		if(methods.onAfterFindOne) setupHook.onAfterFindOne();
		if(methods.onBeforeFind) setupHook.onBeforeFind();
		if(methods.onAfterFind) setupHook.onAfterFind();
		if(methods.onBeforeFindOne) setupHook.onBeforeFindOne();
	}
	
	//these should run after all methods are attached to prototype above so they have access to those methods
	if(!proto.isTemplate && methods.onBeforeStartup) setup.onBeforeStartup(methods); //dont run UltimateTemplate.onBeforeStartup
	else if(proto.isTemplate && proto.onBeforeStartup) setup.onBeforeStartup(proto);
	
	if(methods.onStartup) setup.onStartup();
	
	return extendedProto;
};