Ultimate('UltimateConfig').extends({
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
	
	
	onChildClassStartup: function() {
		var uc = this.createNew();
			
		if(uc.mode) uc._setMode(uc.mode());
		if(uc.environmentIdentifier) uc._setEnvironment(uc.environmentIdentifier());
		uc._addEnvironments(uc.environments);
		
		//dynamically call production vs. development methods; and based on current environment
		this._setupEnvironmentMethods(uc); //methods set in this.production: {}, this.development: {}, this.somethingElse: {}
	},
	

	_setupEnvironmentMethods: function(uc) {
		_.each(uc, function(configMap, prop) {
			if(this._isConfigMap(prop)) this.dynamicifyConfigKeys(configMap);
		});
	},
	dynamicifyConfigKeys: function(configMap) {
		_.each(configMap, function(func, configKey) {
			uc[configKey] = function() {
				var env = this.currentEnvironment();
				if(!this[env)]) throw new Meteor.Error('missing-environment', env+' has no config map');
				
				var funcOrProp = this[env][configKey];
				if(!funcOrProp) throw new Meteor.Error('missing-config-key', configKey+' does not exist in '+env);
					
				return _.isFunction(funcOrProp) ? funcOrProp.apply(this, arguments) : funcOrProp;
			};
		});
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
		return this._noEnvironments;
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

		if(_.isEmpty(environments)) return this._noEnvironments = true;
		
		_.each(environments, function(url, name) {
			url = this._stripTrailingSlash(url);
			this.environments[name] = url;
			this.environmentsByUrl[url] = name;
		}.bind(this));
	},
	_stripTrailingSlash: function(str) {
    if(str.substr(-1) == '/') return str.substr(0, str.length - 1);
    return str;
	},
	_isConfigMap: function(prop) {
		return this.protoHasOwnProperty(prop) && _.isObject(this[prop]) && !this.isPrivateMethod(prop);
	}
});