ModalTabbed = function ModalTabbed(id, options) {
	this.callParentConstructor(id, options);
	this._dep = new Tracker.Dependency;
};

ModalTabbed.extends(Modal, {
	template: function() {
		return Template.modal_wizard;
	},
	data: function() {
		var data = this.applyParent('data');
		
		data.currentTemplate = this.currentTemplate.bind(this);
		data.currentContext = this.currentContext.bind(this);
		
		data.header = data.header || 'modal_tabbed_header';
		data.footer = data.footer || 'modal_tabbed_footer';
		data.submitText = data.closeText || data.submitText;
		
		data.headerData = data.footerData = {
			tabs: this.getTabs(),
			selected: this.selected.bind(this)
		};

		return data;
	},
	
	
	currentTemplate: function() {
		var index = this.getCurrentTabIndex();
		return this.tabs[index].template;
	},
	currentContext: function() {
		var index = this.getCurrentTabIndex();
		return this.tabs[index].data;
	},
	getCurrentTabIndex: function() {
		this._dep.depend();
		return this.currentTabIndex;
	},
	setCurrentTabIndex: function(index) {
		this.currentTabIndex = index;
		this._dep.changed();
	},
	
	selected: function(index) {
		return this.getCurrentTabIndex() === index ? 'active' : ''; 
	},
	
	getTabs: function() {
		return _.map(this.options.tabs, function(tab, index) {
			tab.index = index;
			return tab;
		});
	},
	
	onTabClick: function() {
		this.tabElement().find('li').on('click', function(e) {
			e.preventDefault();
			
			var index = this.tabElement().find('li').index(this);
			this.setCurrentTabIndex(index);
		}.bind(this));
	},
	tabElement: function() {
		return this.element().find('.tab-bar');
	}
});

/**
var tabbed = new ModalTabbed('settings', {
	header: 'settings_header',
	footer: 'settings_footer',
	closeText: 'Done',
	tabs: [
		{
			icon: '/images/gear.js',
			width: 60
			title: 'General',
			template: 'settings_general',
			data: Meteor.user()
		},
		{
			icon: '/images/gear.js',
			width: 60
			title: 'General',
			template: 'settings_general',
			data: Meteor.user()
		}
	];
});
**/