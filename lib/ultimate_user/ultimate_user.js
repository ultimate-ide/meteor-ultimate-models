/**
Ultimate('UltimateUser').extends(UltimateModel, Meteor.users, {
  getEmail: function() {
    return this.emails[0].address;
  },
  isAdmin: function() {
    return Roles.userIsInRole(this._id, ['admin']);
  },
	isInRole: function(role) {
		return Roles.userIsInRole(this._id, [role]);
	}
});
**/