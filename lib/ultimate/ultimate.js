Ultimate = function Ultimate(className) {
	Ultimate.className = className;
	return Ultimate;
};

_.extend(Ultimate, {
  globalScope: this, //assign the globalScope so we can get it wherever needed
  initializing: false,

  classes: {},
  collections: {},
  httpClasses: {}, //for use by optional UltimateHttp package
  
  abstractComponents: {},
  components: {},
  componentsByTemplateName: {},

  wizards: {},
  
  //by assigning these to __meteor_runtime_config__ on the server, they are pre-assigned on the client as well
  mode: __meteor_runtime_config__.MODE || (__meteor_runtime_config__.MODE = process.env.NODE_ENV),
  rootUrl: __meteor_runtime_config__.ROOT_URL || (__meteor_runtime_config__.ROOT_URL = process.env.ROOT_URL),

  //KEEP THIS UP TO DATE IF NEW PROPS ARE ADDED TO THE CLASS OR PROTOTYPE!!!
  reservedWordsRegex: /^(construct|class|className|__type|parent|constructor|classCreated|___proto|createNew)$/,
  usesReservedWord: function(prop) {
    return this.reservedWordsRegex.test(prop);
  },

  //the following are temp props assigned to Ultimate.egProp for use while extending classes
  deleteTemporaryProps: function() {
    delete this.className;
    delete this.parent;
    delete this.protoFromParent;
    delete this.originalConstructor;
    delete this.class;
    delete this.proto;
    delete this.collection;
    delete this.methods;
  },
  userId: function() {
    var userId;

    try {
      userId = Meteor.userId();
    }
    catch(e) {}

    if(!userId) userId = Ultimate.currentUserId; //set in Meteor.publish ovverride

    return userId;
  }
});