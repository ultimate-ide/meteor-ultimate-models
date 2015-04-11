Ultimate('UltimateConfig').extends(UltimateFacade, {
	development: {},
	production: {},
	
	environments: {},
	environmentsByUrl: {},
	
	
	onBeforeStartup: function() {
		var mode = typeof process != 'undefined' ? process.env.NODE_ENV : __meteor_runtime_config__.MODE;
		this.___proto._mode = __meteor_runtime_config__.MODE = mode; //set to runtime config to be passed to client
		
		var url = typeof process != 'undefined' ? process.env.ROOT_URL : __meteor_runtime_config__.ROOT_URL;
		this.___proto._url = __meteor_runtime_config__.ROOT_URL = url; //set to runtime config to be passed to client
	},
	
	
	onChildClassBeforeStartup: function() {
		var uc = this.createNew();
			
		if(uc.mode) uc._setMode(uc.mode());
		if(uc.environmentIdentifier) uc._setEnvironment(uc.environmentIdentifier());
		uc._addEnvironments(uc.environments);
			
		this._setupEnvironmentMethods(uc);//dynamically call methods from production, development, etc, objects
	},
	

	_setupEnvironmentMethods: function(uc) {
		var envKey = this.currentEnvironment(),
			methods = this.getMethods(envKey);
			
		_.extend(this, methods);
	},
	isMethod: function(prop) { //override UltimateBind version call by this.getMethods()
		return this.isStandardMethod(prop) && _.isObject(this[prop]);
	},
	
	
	isEnvironment: function(name) {	
		if(this._noEnvironmentsAdded() && this.isProduction() && name == 'production') return true;
		else return this.envId() == this.environments[name];
	},
	isProduction: function() {
		return this.getMode() == 'production';
	},
	isDevelopment: function() {
		return !this.isProduction();
	},
	isStaging: function() {
		return this.isEnvironment('staging'); //must be defined by end user
	},
	getMode: function() {
		return this._manualMode || this._mode;
	},
	url: function() {
		return this._url;
	},
	envId: function() {
		return this._envId || this.url();
	},
	getDevelopmentUrl: function() {
		return this.developmentId || 'http://localhost:3000';
	},
	currentEnvironment: function() {
		if(this._noEnvironmentsAdded() && this.isProduction()) return 'production';
		else return this.environmentsByUrl[this.envId()];
	},
	
	
	_noEnvironmentsAdded: function() {
		return _.size(this.environments) === 1; //there is only the automatically added development environment
	},
	
	_setMode: function(mode) {
		this._manualMode = mode;
	},
	_setEnvironment: function(envId) {
		this._envId = _envId;
	},
	_createDevelopmentEnvironment: function() {
		this.environments['development'] = this.getDevelopmentUrl();
		this.environmentsByUrl[this.getDevelopmentUrl()] = 'development';
	},
	
	
	_addEnvironments: function(environments) {
		this._createDevelopmentEnvironment();

		_.each(environments, function(url, name) {
			this.environments[name] = url.stripTrailingSlash();
			this.environmentsByUrl[url.stripTrailingSlash()] = name;
		}.bind(this));
	}
});