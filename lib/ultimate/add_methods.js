_.extend(Ultimate, {
  addMethods: function (proto, methods) {
    if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors
    this.prepareSetup(proto, methods);

    if(!_.isEmpty(methods.mixins)) proto.class.mixinMultiple(methods.mixins);

    if(proto.isUltimatePrototype) { //only for extending Ultimate prototypes
      if(proto.isChildOf('UltimateForm')) this.setupForm();
      if(proto.isChildOf('UltimateModel')) this.setupHooks(methods);
    }

    this.deleteTemporaryProps();
    return proto;
  },
  setupCustomClasses: function(methods) {
    if(this.Parent.is('model')) this.setupModel(methods);
    if(this.Parent.is('component')) this.setupComponent(methods);
    if(this.Parent.is('permissions')) this.setupPermissions(methods);
  },
  prepareSetup: function(proto, methods) {
    this.proto = _.extend(proto, methods);
    this.collection = this.proto.collection;
    this.methods = methods;
  }
});