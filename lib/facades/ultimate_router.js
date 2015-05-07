UltimateRouter = Ultimate('UltimateRouter').extends(UltimateFacade, {
	abstract: true,
	deniedMethods: ['path', 'controller', 'template', 'layoutTemplate', 'yieldRegions', 'subscriptions', 'name', 'where', 
  								'waitOn', 'data', 'onRun', 'onRerun', 'onBeforeAction', 'onAfterAction', 'onStop', 'action'],
		
	controller: null,
		
	setTemplateNameConverter: function(str) {
		return str;
	},
	
	
	onFacadeStartup: function() {
		Router.setTemplateNameConverter(this.setTemplateNameConverter.bind(this));
		
		var routes = this.getMethods(null, null, null, true),
			controllerName = this.className + 'Ultimate',
			options = _.pick(this, this.deniedMethods), //deniedMethods are core config props of Iron Router
			controller = this._routeController(options); 

		this._enableIronRouterControllerInheritance(controller, controllerName);
			
		_.each(routes, function(config, key) {
			if(_.isFunction(config)) {
				var configString = config.toString();

				if(configString.indexOf('subscribe(') > -1) config = {waitOn: config.bind(this)};
				else if(configString.indexOf('this.render') > -1) config = {action: config.bind(this)};
				else if(configString.indexOf('this.redirect') > -1) config = {action: config.bind(this)};					
				else config = {data: config.bind(this)};
			}
			
			var path = config.path || this.pathFromKey(key);	
			delete config.path;
		
			config.controller = config.controller || controllerName;
			config.name = config.name || this.nameFromKey(key);
			if(this.where) config.where = this.where;

			Router.route(path, config);
		}, this);
	},
	
	
	_routeController: function(options) {
		if(this._controller) return this._controller;
		
		delete options.controller;  //same as this.controller; might mess shit up extending a RouteController with it
		
		return this._controller = this.controller ? Ultimate.globalScope[this.controller].extend(options) : RouteController.extend(options);
	},
	_enableIronRouterControllerInheritance: function(controller, controllerName) {
		Ultimate.globalScope[controllerName] = controller; 
	},
	
	
	pathFromKey: function(key) {
		key = key.replace('_', '-');
		if(key.indexOf('/') !== 0) key = '/'+key;
		return key;
	},
	nameFromKey: function(key) {
		if(key.indexOf('/') === 0) key = key.substr(1);
		if(key.indexOf('/') !== -1) key = key.substr(0, key.indexOf('/'));		
		
		return key.replace('-', '_');
	}
});



UltimateRouterServer = Ultimate('UltimateRouterServer').extends(UltimateRouter, {
	abstract: true,
	
	onBeforeStartup: function() {	
		var routeFuncs = this.getMethods();
		
		_.each(routeFuncs, function(func, key) {	
			var path = this.pathFromKey(key);	
			Router.route(path, func, {where: 'server'});
		}, this);
		
		this._handleOnBeforeAction();
	},
	
	
	_handleOnBeforeAction: function() {
		if(!this.onBeforeAction) return;
		Router.onBeforeAction(this.onBeforeAction, {where: 'server'});
	}
});