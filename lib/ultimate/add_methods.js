_.extend(Ultimate, {
  addMethods: function (proto, methods) {
    if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors
    this._prepareSetup(proto, methods);

    if(!_.isEmpty(methods.mixins)) proto.class.mixinMultiple(methods.mixins);
    this.proto = _.extend(proto, methods); //override mixin methods (current class -> mixin -> parents)
    
    if(proto.isUltimatePrototype) { //only for extending Ultimate prototypes
      if(proto.isChildOf('UltimateForm')) this.setupForm();
      if(proto.isChildOf('UltimateModel')) this.setupHooks(methods);
    }

    this.deleteTemporaryProps();
    return proto;
  },
  setupCustomClasses: function(methods) {
    if(this.parent.is('model')) this.setupModel(methods);
    if(this.parent.is('component')) this.setupComponent(methods);
    if(this.parent.is('permissions')) this.setupPermissions(methods);
  },
  _prepareSetup: function(proto, methods) {
    this.collection = proto.collection;
    this.methods = methods;
  }
});