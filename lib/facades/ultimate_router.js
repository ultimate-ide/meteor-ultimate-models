Ultimate('UltimateRouter').extends(UltimateFacade, {
	deniedMethods: ['path', 'controller', 'template', 'layoutTemplate', 'yieldRegions', 'subscriptions', 'name', 'where' 
  								'waitOn', 'data', 'onRun', 'onRerun', 'onBeforeAction', 'onAfterAction', 'onStop', 'action'],
		
	controller: null,
		
	construct: function() {
		Router.setTemplateNameConverter(this.setTemplateNameConverter.bind(this));
	},
	setTemplateNameConverter: function(str) {
		return str;
	},
	
	
	onStart: function(self) {	
		var routes = self.getMethods(),
			controllerName = self.className,
			options = _.pick(self, self.deniedMethods),
			controller = self._routeController().extend(options); 
			
		self._enableControllerInheritance(controller, controllerName);
			
		_.each(routes, function(config, key) {
			if(_.isFunction(config)) {
				if(config.indexOf('Meteor.subscribe') > -1) config = {waitOn: config};
				else if(config.indexOf('this.render') > -1) config = {action: config};
				else if(config.indexOf('this.redirect') > -1) config = {action: config};
				else config = {data: config};
			}
			
			var path = config.path || self.pathFromKey(key);	
			delete config.path;
			
			config.controller = config.controller || controllerName;
			config.name = config.name || self.templateFromKey(key);
			if(self.where) config.where = self.where;
			
			Router.route(path, config);
		});
	},
	
	
	_routeController: function() {
		return this.controller = this.controller || RouteController; //inherited controller || RouteController
	},
	_enableControllerInheritance: function(controller, controllerName) {
		globalScope[controllerName] = self.___proto.controller = controller; 
	},
	
	
	pathFromKey: function(key) {
		key.replace('_', '-');
		if(key.indexOf('/') !== 0) key = '/'+key;
		return key;
	},
	templateFromKey: function(key) {
		if(key.indexOf('/') === 0) key = key.substr(1);
		if(key.indexOf('/') !== -1) key = key.substr(0, key.indexOf('/') + 1);		
		
		return key.replace('-', '_');
	}
});



Ultimate('UltimateRouterServer').extends(UltimateRouter, {
	abstract: true,
	
	onStart: function(self) {	
		var routeFuncs = self.getMethods();
		
		_.each(routeFuncs, function(func, key) {	
			var path = self.pathFromKey(key);	
			Router.route(path, func, {where: 'server'});
		});
		
		self._handleOnBeforeAction();
	},
	
	
	_handleOnBeforeAction: function() {
		if(!this.onBeforeAction) return;
		Router.onBeforeAction(this.onBeforeAction, {where: 'server'});
	}
});