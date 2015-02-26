Function.prototype.__extend = function(proto, methods) {
	var setup = new Setup(proto, methods);
	
	if(methods.onStartup) setup.onStartup();
	
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

	return _.extend.apply(_, arguments);
};