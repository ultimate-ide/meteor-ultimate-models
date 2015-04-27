_.extend(Ultimate, {
  setupMethods: function (proto, methods) {
    if(!_.isObject(methods)) methods = {}; //just in case, to prevent errors

    this.prepareSetup(proto, methods);

    if(proto.isUltimate) { //an Ultimate class's statics or Ultimate prototype is being extended.
      if(methods.mixins) this.mixins();

      if(proto.isUltimatePrototype) { //only for extending Ultimate prototypes
        if(proto.isChildOf('UltimateForm')) {
          if(methods.schema) this.schema();
          if(methods.defineErrorMessages) this.defineErrorMessages();
          if(methods.forms) this.forms();
        }

        if(proto.isChildOf('UltimateModel')) {
          this.hooks(methods);
          if(!proto.classCreated) this.hooks(proto.parent); //make sure hooks from possible parent models are added too
        }

        //Run after all methods are attached to proto above so they have access to those methods,
        //but they will only have access to methods defined in initial .extends({}) map argument
        if(!proto.isClassCreated()) {
          this.onBeforeStartup();
          this.onStartup();
        }
      }
      else if(proto.isStatic && !proto.class.staticsSetup) this.onBeforeStartupStatic(); //called on statics only after first call to extendStatic()
    }

    this.deleteTemporaryProps();
    return this.proto;
  },
  prepareSetup: function(proto, methods) {
    this.proto = _.extend(proto, methods);
    this.collection = this.proto.collection;
    this.methods = methods;
  }
});