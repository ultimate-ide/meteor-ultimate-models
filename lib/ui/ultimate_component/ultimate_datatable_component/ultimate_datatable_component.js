Ultimate('UltimateDatatableComponent').extends(UltimateComponent, 'ultimate_datatable_component', {
	abstract: true,
	name: null,
	pub: null,
	subscription: null,
	collection: null,
	selector: null,
	tableColumns: [],
	cssClasses: null,
	useUltimateComponentModel: null, 
	
	
	_applyBind: function() {
		return this.useUltimateComponentModel 
			? UltimateComponentModel.prototype._applyBind(this, arguments) 
			: this.applyParent('_applyBind', arguments);
	},
	
	onBeforeComponentStartup: function() {
		Template.UltimateDatatableComponent.copyAs([this.templateName]);
		this.datatable();
	},
	
	
	datatable: function() {
		this._tabular = this._tabular || new Tabular.Table(this.getOptions());
	},
	getOptions: function() {
		var options = {
			name: this.getName(),
		  collection: this.getCollection(),
			pub: this.getSubscription(),
			selector: this.getSelector(),
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
	
	
	onRendered: function() {
		this.setupDatatableEvents();
	},
	
	
	getName: function() {
		return this.name || this.getCollection()._name;
	},
	getCollection: function() {
		return this.collection || this.subscription.model.collection;
	},
	getSubscription: function() {
		return this.subscription || this.pub;
	},
	getSelector: function() {
		return (this.subscription ? this.subscription.selector : null) || this.selector;
	},
	
	
	getColumns: function() {
		return _.map(this.tableColumns, function(column) {
			if(column.tmpl) {
				column.tmpl = Meteor.isClient && Template[column.tmpl];
				this.includes.push(column.tmpl); //included cell templates will inherit helpers from here
			}
			return column;
		}, this);
	},
	
	
	getCssClasses: function() {
		return this.cssClasses;
	},
	
	
	rowData: function(key) {
		var data = this.datatable().row(this.currentEvent.currentTarget).data();
		return key ? data[key] : data;
	},
	currentData: function(key) {
		var data;
		
		if(this.currentEvent && (data = this.rowData(key))) return data;
		else return this.applyParent('currentData', arguments);
	},
	
	
	setupDatatableEvents: function() {
		_.chain(this)
			.filterObject(this._isDatatableEvent)
			.each(function(handler, name) {
				name = name.replace('on', '').toLowerCase();
				this.datatable().on(name+'.dt', handler);
			}, this);
	}
	
	_isDatatableEvent: function(option, prop) {
		this._dtEventsRegex = this._dtEventsRegex || /^(onColumn-sizing|onColumn-visibility|onDestroy|onDraw|onError|onInit|onLength|onOrder|onPage|onPreXhr|onProcessing|onSearch|onStateLoaded|onStateLoadParams|onStateSaveParams|onXhr)$/;			
		return this._dtEventsRegex.test(prop);
	}
});


Ultimate('InstancesTable').extends(UltimateDatatableComponent, {
	subscription: User.with('orders').keep().cache().handle().subscribe(),
	columns: [
    {data: "title", title: "Title"},
    {data: "author", title: "Author"},
    {data: "copies", title: "Copies Available"},
    {     
			data: "lastCheckedOut", 
			title: "Last Checkout", 
			render: function(val, type, doc) {
        return moment(val).calendar();
      }   
    },
    {tmpl: 'bookCheckOutCell'}
  ]
});