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
		'aldeed:autoform',
		'forwarder:autoform-wizard'
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
	
	api.add_files([
		'lib/forms.html',
		'lib/helpers.js'
	], ['client']);
	
	
  api.export && api.export(['Base', 'Model', 'BaseHTTP'], ['client', 'server']);
	api.export && api.export(['UltimateSync'], ['server']);
});
