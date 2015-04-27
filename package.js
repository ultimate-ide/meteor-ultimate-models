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
		'lib/overrides/underscore_mixin.js',
		'lib/overrides/meteor_overrides.js',
		'lib/overrides/quickies.js'
	], ['client', 'server']);
	
	
	/** INHERITANCE & ULTIMATECLASS CORE **/
	
  api.add_files([
		'lib/ultimate/ultimate.js',
		'lib/ultimate/extends.js',
		'lib/ultimate/setup_methods.js',
    'lib/ultimate/setup_all.js',
		'lib/ultimate/setup_form.js',
		'lib/ultimate/setup_model.js',

		'lib/ultimate_class/ultimate_class.js',
		'lib/ultimate_class/extend.js',
		'lib/ultimate_class/behavior.js',
		'lib/ultimate_class/tracker.js',
		'lib/ultimate_class/timer.js',
		'lib/ultimate_class/sync.js',
		
		'lib/ultimate_http/ultimate_http.js',
		'lib/ultimate_http/meteor_method.js',
		'lib/ultimate_http/stub_obj.js',
		'lib/ultimate_http/meteor_call.js',
		'lib/ultimate_http/startup.js',
		'lib/ultimate_http/extend_ultimate_class.js'
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

    'lib/ultimate_behavior/ultimate_behavior.js', //depends on ultimate_facade too
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
		'lib/ultimate_form/ultimate_form.js',
		'lib/ultimate_form/mongo_attributes.js',
		'lib/ultimate_form/reactive_methods.js',

		'lib/ultimate_model/ultimate_model.js',
		'lib/ultimate_model/additional_methods.js',
		
		'lib/ultimate_user/ultimate_user.js'

  ], ['client', 'server']);

	api.export(['UltimateForm', 'UltimateModel', 'UltimateUser'], ['client', 'server']);


	api.add_files([
		'lib/ultimate_form/templates.html',
		'lib/ultimate_form/templates.js',
	], ['client']);
		
		
		
		
	/** UTILITIES **/
	
	api.add_files([
		'lib/utilities/ultimate_sync.js',
		'lib/utilities/ultimate_email.js',
    'lib/utilities/ultimate_exec.js',
    'lib/utilities/ultimate_remote_exec.js'
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
		'lib/ultimate_modal/ultimate_modal.js',
		'lib/ultimate_modal/ultimate_modal_form.js',
		'lib/ultimate_modal/ultimate_modal_content.js',
		
		
		'lib/ultimate_modal/ultimate_model_prompt.js',
		'lib/ultimate_modal/ultimate_schema_prompt.js',
		'lib/ultimate_modal/ultimate_prompt.js',
		
		'lib/ultimate_modal/ultimate_modal_wizard.js',
		'lib/ultimate_modal/ultimate_modal_tabbed.js',
		
	  'lib/ultimate_modal/templates.html',
		'lib/ultimate_modal/templates.js',


	  'lib/ultimate_wizard/ultimate_wizard.js',
		'lib/ultimate_wizard/templates.html',
	  'lib/ultimate_wizard/templates.js',
		

		'lib/ultimate_events/ultimate_events.js',
		
		'lib/ultimate_component/ultimate_component_parent.js',
		'lib/ultimate_component/ultimate_component.js',
		'lib/ultimate_component/ultimate_component_model.js',
		
		'lib/ultimate_component/helper_shortcut.js',
		'lib/ultimate_component/instance_methods.js',
		'lib/ultimate_component/instance_data.js',
		'lib/ultimate_component/mixins.js',
		
		'lib/ultimate_component/selected_helper.js',


    //'lib/ultimate_datatable_component/ultimate_datatable_component.js',
    //'lib/ultimate_datatable_component/datatable_methods.js',
    //'lib/ultimate_datatable_component/ultimate_datatable_component.html'

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
