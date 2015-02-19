Package.describe({
  summary: "MVC-like models in meteor",
  version: "0.0.8",
  git: "https://github.com/nucleuside/meteor-smart-models.git",
  name: "nucleuside:smart-models"
});

Package.on_use(function (api, where) {
  api.versionsFrom("METEOR@0.9.1");
  api.use([
		"underscore",
    'templating',
    'blaze',
		'aldeed:simple-schema',
		'aldeed:autoform'
	]);

  api.add_files([
    'lib/inheritance.js',
		
    'lib/extend_http/base_http.js',
    'lib/extend_http/meteor_method.js',
    'lib/extend_http/stub_obj.js',
    'lib/extend_http/meteor_call.js',
    'lib/extend_http/startup.js',	
		
		'lib/static_methods.js',
    'lib/base_class.js',
		
		'lib/base_model.js',
  ], ['client', 'server']);
	
	api.add_files([
		'lib/ultimate_sync.js'
	], ['server']);

	
	
  api.export && api.export(['Base', 'Model', 'BaseHTTP'], ['client', 'server']);
	api.export && api.export(['UltimateSync'], ['server']);
	
	
	/** UI TOOLS **/
	api.use([
	  'tracker',
	  'session',
		'naxio:flash'
	], 'client');

	api.use('aldeed:autoform@3.0.0 || 4.0.0', 'client');

	api.addFiles([
	  'lib/wizard.html',
	  'lib/wizard.js',
		'lib/templates.js',
	
		'lib/modal/modal.js',
		'lib/modal/modal_content.js',
		'lib/modal/modal_wizard.js',
		'lib/modal/modal_tabbed.js',
		'lib/modal/modal_form.js',
		'lib/modal/model_prompt.js',
		'lib/modal/schema_prompt.js',
		'lib/modal/ultimate_prompt.js'
	], 'client');

	api.export(['wizardsById', 'wiz'], ['client']);
});
