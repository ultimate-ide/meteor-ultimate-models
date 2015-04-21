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
		'lib/utilities/ultimate_clone.js'
	], ['client', 'server']);
	
	
	
	api.add_files([
		'lib/overrides/string_methods.js',
		'lib/overrides/array_methods.js',
		'lib/overrides/underscore_mixin.js',
		'lib/overrides/meteor_overrides.js',
		'lib/overrides/quickies.js'
	], ['client', 'server']);
	
	
	/** INHERITANCE & ULTIMATECLASS CORE **/
	
  api.add_files([
    'lib/core/extend/__extend/setup.js',
		'lib/core/extend/__extend/setup_form.js',
		'lib/core/extend/__extend/setup_model.js',
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
		'lib/core/ultimate_class/behavior.js',
		'lib/core/ultimate_class/tracker.js',
		'lib/core/ultimate_class/timer.js',
		'lib/core/ultimate_class/http.js',
		'lib/core/ultimate_class/sync.js',	
		
  ], ['client', 'server']);

  api.export(['Ultimate', 'UltimateClass'], ['client', 'server']);
	
	
	
	Npm.depends({
		"remote-exec": "0.0.3"
	});
	
	api.add_files([
		'lib/utilities/ultimate_exec.js'
	], ['server']);
	
	
	/** ULTIMATE_REACTIVE **/
	
	api.add_files([
		'lib/ultimate_reactive/ultimate_reactive.js',
		'lib/ultimate_reactive/autorun_subscribe.js',
		'lib/ultimate_reactive/get_autorun_subscribe.js',
	], ['client']);
	
	
	
	/** FACADES **/
	
	api.use([
		'accounts-base' //for ultimate_accounts.js
	]);
		
	
	api.use([
	  'iron:router@1.0.5'
	], ['client', 'server']);
	
	
	api.add_files([
		'lib/facades/ultimate_facade.js',
		'lib/facades/ultimate_startup.js',
		'lib/facades/ultimate_config.js',
		'lib/facades/ultimate_accounts.js',
		'lib/facades/ultimate_permissions.js',
		'lib/facades/ultimate_router.js',
		'lib/facades/ultimate_publish.js',
	], ['client', 'server']);
	
	
	/** ULTIMATE_FORM & ULTIMATE_MODEL **/
	
	api.use([
		'matb33:collection-hooks@0.7.9',
		'smeevil:session-store@1.0.0',
		'alanning:roles@1.2.12',
		'meteorhacks:aggregate@1.2.1',
		'meteorhacks:subs-manager@1.3.0'
	]);
	
	api.add_files([
		'lib/form/ultimate_form.js',
		'lib/form/mongo_attributes.js',
		'lib/form/reactive_methods.js',

		'lib/model/ultimate_model.js',
		'lib/model/additional_methods.js',
		
		'lib/model/ultimate_behavior.js',
		
		'lib/user/ultimate_user.js',

  ], ['client', 'server']);

	api.export(['UltimateForm', 'UltimateModel', 'UltimateUser'], ['client', 'server']);


	api.add_files([
		'lib/form/templates.html',
		'lib/form/templates.js',
	], ['client']);
		
		
		
		
	/** ULTIMATE_SYNC **/
	
	api.add_files([
		'lib/utilities/ultimate_sync.js',
		'lib/utilities/ultimate_email.js',
	], ['server']);

	api.export(['UltimateSync'], ['server']);
	
	
	
	
	/** UI TOOLS **/
	
	api.use([
	  'tracker',
	  'session',
		'naxio:flash@0.2.2',
		'percolate:velocityjs@1.2.1_1',
		'aldeed:template-extension@3.4.3'
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
		

		'lib/ui/ultimate_component/ultimate_events/ultimate_events.js',
		
		'lib/ui/ultimate_component/ultimate_component_parent.js',
		'lib/ui/ultimate_component/ultimate_component.js',
		'lib/ui/ultimate_component/ultimate_component_model.js',
		
		'lib/ui/ultimate_component/helper_shortcut.js',
		'lib/ui/ultimate_component/instance_methods.js',
		'lib/ui/ultimate_component/instance_data.js',	
		'lib/ui/ultimate_component/mixins.js',
		
		'lib/ui/ultimate_component/helpers/selected.js'

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
