Blaze.registerHelper("umSelected", function(val, key, nonSelectedClass, selectedClass) {
	if(this.model[key]) return val === this.model[key] ? selectedClass : nonSelectedClass;
	else return val === match ? selectedClass : nonSelectedClass;
});