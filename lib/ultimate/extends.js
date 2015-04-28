_.extend(Ultimate, {
  extends: function (Parent, methods, staticMethods) {
    if(arguments.length <= 1 && !_.isFunction(Parent)) {
      methods = Parent;
      Parent = UltimateClass;
    }

    console.log('CLASS START', this.className, Parent.className);

    methods = methods || {};
    this.Parent = Parent;
    this.originalConstructor = methods ? methods.construct : null;

    var Class = this.transformClass(); //some fancy stuff is done here; dig deeper if u want

    this.attachPrototype(Class);
    this.configurePrototype();
    this.configureStatics();
    this.setupCustomClasses(methods);
    this.addMethods(Class.prototype, methods);
    this.addMethods(Class, staticMethods);

    Class.emitBeforeStartup();
    Class.emitStartup();

    console.log('CLASS COMPLETE', Class.className, Parent.className);

    return Ultimate.globalScope[Class.className] = Class; //replace the original var in the global scope, leaping over any closures
    //return eval(className + ' = ' + Class); //assign class within package scope
  },


  transformClass: function() {
    var isChildOfForm = this._isChildOf('UltimateForm'),
      isChildOfModel = this._isChildOf('UltimateModel'),
      originalConstructor = this.originalConstructor,
      intializing = false;
  
    initializing = true;
    this.protoFromParent = new this.Parent; //Instantiate a base class, but don't run the constructor
    initializing = false; //because 'initializing' var is in this closure during 'new this.parent' cuz 'this.Parent === Class' below
      
    var Class = function Class() {
      if(initializing) return; //construction performed by originalConstructor after, but only after all this initial setup

      this.attachBehaviors();
      var args = _.toArray(arguments);
      this.emit.apply(this, ['beforeConstruct'].concat(args));
      
      if(this.defaults) _.extend(this, this.defaults);
      
      if(arguments[0] == 'no_params') return; //this object will be populdated in extendHTTP code
    
    
      if(isChildOfForm) UltimateForm.construct.apply(this, arguments);
      else if(isChildOfModel) UltimateModel.construct.apply(this, arguments);
      
      var result;
      
      if(originalConstructor) result = originalConstructor.apply(this, arguments); //call the original constructor
      else if(!isChildOfForm && !isChildOfModel) result = this.construct.apply(this, arguments); 
      
      this.emit.apply(this, ['afterConstruct'].concat(args));
      
      return result;
    };
    
    return this._isDevelopment() ? eval(this._prepStringForEval(Class)) : Class; //development uses NAMED FUNCTIONS!
  },
  
  
  attachPrototype: function(Class) {
    Class.prototype = this.protoFromParent; //ultimate the fancy prototype setup was done in transformClass, with the 'intializing' var
    Ultimate.classes[this.className] = Class;
    this.Class = Class;
  },
  configurePrototype: function() {
    var Class = this.Class;
    
    Class.prototype.constructor = Class; //Enforce constructor to be what we expect
    Class.prototype.class = Class; //but also put it here so we can use more "class-like" terminology
    Class.prototype.parent = this.Parent.prototype; //make it so we can call parent method
    Class.prototype.className = this.className;
    Class.prototype.__type = this._typePrefix()+'instance_'+this.className; //for use by UltimateHTTP functionality 
    Class.prototype.___proto = Class.prototype;
    Class.prototype.createNew = this._createNewFunc(Class);
  },
  configureStatics: function() {
    var Class = this.Class;
    
    Class.parent = this.Parent;
    Class.className = this.className;
    Class.__type = this._typePrefix()+'class_'+this.className; //for use by UltimateHTTP functionality
    Class.construct = this.originalConstructor;
    Class.createNew = this._createNewFunc(Class);
    Class.class = Class;

    UltimateClass.mixinStatic.call(this.Class, this.Parent); //mixinStatic() method doesn't exist on class till after this call
    Class.attachBehaviors();
  },
  

  _isDevelopment: function() {
    return Ultimate.mode === 'development';
  },
  _isChildOf: function(className) {
    return this.Parent.className == className || this.Parent.isChildOf(className);
  },
  _prepStringForEval: function(Class) {
    return '(' + Class.toString().replace(/Class/g, this.className) + ')';
  },
  _createNewFunc: function(Class) {
    return function(a, b, c, d, e, f, g, h) { //didnt want to do a dynamic version cuz function Name is lost
      return new Class(a, b, c, d, e, f, g, h);
    };
  },
  _typePrefix: function() {
    if(this.className == 'UltimateModel') return 'model_';
    else if(this.className == 'UltimateForm') return 'form_'; 
    else if(this.Parent.is('form') && !this.Parent.is('model')) return 'form_';
    else if(this.Parent.is('model')) return 'model_';
    else if(this.Parent.is('component')) return 'component_';
    
    else return '';
  }
});