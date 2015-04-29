UltimateUser = Ultimate('UltimateUser').extends(UltimateModel, {
  abstract: true,
  collection: Meteor.users,
  publishFields: [],

  onBeforeStartup: function() {
    this.collection._transform = function(doc) {
      return doc.className ? new Ultimate.classes[doc.className](doc) : new this.class(doc);
    }.bind(this);
  },
  onStartup: function() {
    if(_.isEmpty(this.publishFields)) return;

    var self = this;

    if(Meteor.isServer) {
      Meteor.publish('ultimate_user_self', function() {
        self.publishSelf(this);
      });
    }
    else Meteor.subscribe('ultimate_user_self');
  },

  getEmail: function() {
    return this.emails[0].address;
  },
  isAdmin: function() {
    return Roles.userIsInRole(this._id, ['admin']);
  },
	isInRole: function(role) {
		return Roles.userIsInRole(this._id, [role]);
	},
  publishSelf: function(pub) {
    if(this.publishFields) {
      var options = {};
      options.fields = {};

      _.each(this.publishFields, function(key) {
        options.fields[key] = 1;
      });

      return Meteor.users.find(pub.userId, options);
    }
    else return Meteor.users.find(pub.userId);
  }
});

UltimateUser.extendServer({
  getToken: function(name) {
    return this.services[name].accessToken;
  }
});
