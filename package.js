Package.describe({
  summary: "MVC-like models in Meteor & A Lot More",
  version: "0.0.2",
  git: "https://github.com/ultimate-ide/meteor-ultimate-models.git",
  name: "ultimateide:ultimate-models"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use([
		"underscore",
    'templating',
    'blaze',
		'http',
		'aldeed:simple-schema@1.3.0',
		'aldeed:autoform@4.2.2',
		'reactive-dict'
	]);


  api.add_files([
    'lib/core/extend/__extend/setup.js',
		'lib/core/extend/__extend/setup_hook.js',
		'lib/core/extend/__extend/__extend.js',
		'lib/core/extend/extend.js',
		'lib/core/extend/mixin.js',
		'lib/core/extend/utility.js',
		'lib/core/inheritance/helper.js',
		'lib/core/inheritance/extends.js',

		
		'lib/core_http/ultimate_http.js',
		'lib/core_http/meteor_method.js',
		'lib/core_http/stub_obj.js',
		'lib/core_http/meteor_call.js',
		'lib/core_http/startup.js',
		
		
		'lib/core/ultimate_class/ultimate_class.js',
		'lib/core/ultimate_class/tracker.js',
		'lib/core/ultimate_class/timer.js',
		'lib/core/ultimate_class/http.js',
		'lib/core/ultimate_class/sync.js',	
		
  ], ['client', 'server']);

  api.export(['Ultimate', 'UltimateClass'], ['client', 'server']);
	
	
	
	
	/** ULTIMATE_FORM & ULTIMATE_MODEL **/
	
	api.use([
		'matb33:collection-hooks@0.7.9',
		'smeevil:session-store@1.0.0'
	]);
	
	api.add_files([
		'lib/form/ultimate_form.js',
		'lib/form/mongo_attributes.js',
		'lib/form/reactive_methods.js',
		'lib/form/form_extends.js',

		'lib/model/ultimate_model.js',
		'lib/model/additional_methods.js',
		'lib/model/model_extends.js',

  ], ['client', 'server']);

	api.export(['UltimateForm', 'UltimateModel'], ['client', 'server']);


	api.add_files([
		'lib/form/templates.html',
		'lib/form/templates.js',
	], ['client']);
		
		
		
		
	/** ULTIMATE_SYNC **/
	
	api.add_files([
		'lib/utilities/ultimate_sync.js',
	], ['server']);

	api.export(['UltimateSync'], ['server']);
	
	
	
	
	/** UI TOOLS **/
	
	api.use([
	  'tracker',
	  'session',
		'naxio:flash@0.2.2'
	], 'client');


	api.addFiles([
		'lib/ui/modal/core/ultimate_modal.js',
		'lib/ui/modal/core/ultimate_modal_form.js',
		'lib/ui/modal/popups/ultimate_modal_content.js',
		
		
		'lib/ui/modal/popups/ultimate_model_prompt.js',
		'lib/ui/modal/popups/ultimate_schema_prompt.js',
		'lib/ui/modal/core/ultimate_prompt.js',
		
		'lib/ui/modal/popups/ultimate_modal_wizard.js',
		'lib/ui/modal/popups/ultimate_modal_tabbed.js',
		
	  'lib/ui/modal/templates.html',
		'lib/ui/modal/templates.js',


	  'lib/ui/wizard/ultimate_wizard.js',
		'lib/ui/wizard/templates.html',
	  'lib/ui/wizard/templates.js',


		'lib/ui/ultimate_template/helpers/selected.js',
		'lib/ui/ultimate_template/ultimate_events/ultimate_events.js',
		'lib/ui/ultimate_template/ultimate_template.js',
		'lib/ui/ultimate_template/instance_methods.js',
		'lib/ui/ultimate_template/instance_data.js',
		'lib/ui/ultimate_template/autorun_subscribe.js',
		'lib/ui/ultimate_template/get_set_methods.js',
		
	], 'client');

	api.export([ 
		'UltimateModal', 
		'UltimateModalForm', 
		'UltimatePrompt',
		'UltimateModalContent', 
		'UltimateModalTabbed', 
		'UltimateModalWizard',
		'UltimateWizards',
		'UltimateWizard'
	], ['client']);
});
