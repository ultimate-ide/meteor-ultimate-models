UltimateDatatableComponent.extend({
	tables: function() {
		var dt = this.datatable();
		return dt.tables.apply(dt, arguments);
	},
	table: function() {
		var dt = this.datatable();
		return dt.table.apply(dt, arguments);
	},
	columns: function() {
		var dt = this.datatable();
		return dt.columns.apply(dt, arguments);
	},
	column: function() {
		var dt = this.datatable();
		return dt.column.apply(dt, arguments);
	},
	rows: function() {
		var dt = this.datatable();
		return dt.rows.apply(dt, arguments);
	},
	row: function() {
		var dt = this.datatable();
		return dt.row.apply(dt, arguments);
	},
	cells: function() {
		var dt = this.datatable();
		return dt.cells.apply(dt, arguments);
	},
	cell: function() {
		var dt = this.datatable();
		return dt.cells.apply(dt, arguments);
	},
	
	
	ajax: function() {
		var dt = this.datatable();
		return dt.ajax.apply(dt, arguments);
	},
	clear: function() {
		var dt = this.datatable();
		return dt.clear.apply(dt, arguments);
	},
	data: function() {
		var dt = this.datatable();
		return dt.data.apply(dt, arguments);
	},
	destroy: function() {
		var dt = this.datatable();
		return dt.destroy.apply(dt, arguments);
	},
	draw: function() {
		var dt = this.datatable();
		return dt.draw.apply(dt, arguments);
	},
	init: function() {
		var dt = this.datatable();
		return dt.init.apply(dt, arguments);
	},
	off: function() {
		var dt = this.datatable();
		return dt.off.apply(dt, arguments);
	},
	on: function() {
		var dt = this.datatable();
		return dt.on.apply(dt, arguments);
	},
	one: function() {
		var dt = this.datatable();
		return dt.one.apply(dt, arguments);
	},
	order: function() {
		var dt = this.datatable();
		return dt.order.apply(dt, arguments);
	},
	page: function() {
		var dt = this.datatable();
		return dt.page.apply(dt, arguments);
	},
	search: function() {
		var dt = this.datatable();
		return dt.search.apply(dt, arguments);
	},
	settings: function() {
		var dt = this.datatable();
		return dt.settings.apply(dt, arguments);
	},
	state: function() {
		var dt = this.datatable();
		return dt.state.apply(dt, arguments);
	}
});