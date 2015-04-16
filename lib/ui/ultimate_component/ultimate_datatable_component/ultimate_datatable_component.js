Ultimate('UltimateDatatableComponent').extends(UltimateComponent, 'ultimate_datatable_component', {
	name: null,
	pub: null,
	subscription: null,
	collection: null,
	selector: null,
	columns: [],
	
	onChildClassBeforeStartup: function() {
		this.newTabular();
		Template.UltimateDatatableComponent.copyAs([this.templateName]);
	},
	
	
	getTabular: function() {
		this._tabular = this._tabular || new Tabular.Table(this.getOptions());
	},
	getOptions: function() {
		var options = {
			name: this.getName(),
		  collection: this.getCollection(),
			pub: this.getSubscription(),
			selector: this.getSelector();
		  columns: this.getColumns()
		};
		
		return _.extend(options, this.getExtraOptions());
	},
	
	
	getExtraOptions: function() {
		return _.filterObject(this, this._isOption);
	},
	_isOption: function(option, prop) {
		this._optionsRegex = this._optionsRegex || /^(allow|allowFields|extraFields|scrollY|paging|autoWidth|deferRender|info|jQueryUI|lengthChange|ordering|paging|processing|scrollX|scrollY|searching|serverSide|stateSave|ajax|data|createdRow|drawCallback|footerCallback|formatNumber|headerCallback|infoCallback|initComplete|preDrawCallback|rowCallback|stateLoadCallback|stateLoaded|stateLoadParams|stateSaveCallback|stateSaveParams|deferLoading|destroy|displayStart|dom|lengthMenu|orderCellsTop|orderClasses|order|orderFixed|orderMulti|pageLength|pagingType|renderer|retrieve|scrollCollapse|search|searchCols|searchDelay|search|stateDuration|stripeClasses|tabIndex|columnDefs|columns|language)$/;			
		return this._optionsRegex.test(prop);
	},
	
	
	getName: function() {
		return this.name || this.getCollection()._name;
	},
	getCollection: function() {
		return this.collection || this.subscription.model.collection();
	},
	getSubscription: function() {
		return this.subscription || this.pub;
	},
	getSelector: function() {
		return (this.subscription ? this.subscription.selector : null) || this.selector;
	},
	
	
	getColumns: function() {
		return _.map(this.columns, function(column) {
			if(column.tmpl) column.tmpl = Meteor.isClient && Template[column.tmpl];
			return column;
		});
	},
	
	
	datatable: function() {
		return $(this.currentEvent.target).closest('table').DataTable();
	},
	rowData: function() {
		this.getDatatable().row(this.currentEvent.currentTarget).data();
	}
});


Ultimate('InstancesTable').extends(UltimateDatatableComponent, {
	subscription: User.with('orders').keep().cache().handle().subscribe(),
	columns: [
    {data: "title", title: "Title"},
    {data: "author", title: "Author"},
    {data: "copies", title: "Copies Available"},
    {
			data: "lastCheckedOut", title: "Last Checkout", 
			render: function (val, type, doc) {
        return moment(val).calendar();
      }
    },
    {tmpl: 'bookCheckOutCell'}
  ]
});