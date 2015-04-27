_.extend(Ultimate, {
  extends: function (Parent, customParam, methods) {
    if(arguments.length <= 1 && !_.isFunction(Parent)) {
      methods = Parent;
      Parent = UltimateClass;
    }
    else if(arguments.length === 2) {
      methods = customParam;
      customParam = null;
    }

    if(_.isEmpty(methods)) methods = {};

    console.log('CLASS START', this.className, Parent.className);

    this.Parent = Parent;
    this.originalConstructor = methods.construct;

    var Class = this.transformClass(); //some fancy stuff is done here; dig deeper if u want
    this.attachPrototype(Class);
    this.configurePrototype();
    this.configureStatics();

    if(Parent.is('model')) this.setupModel(methods, customParam);
    if(Parent.is('component')) this.setupComponent(methods, customParam);
    if(Parent.is('permissions')) this.setupPermissions(methods, customParam);

    this.addMethods(methods);

    console.log('CLASS COMPLETE', Class.className, Parent.className);

    Class.classCreated = Class.prototype.classCreated = true;

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
    
    this._mixinStatic();
    Class.attachBehaviors();
  },
  addMethods: function(methods) {
    this.extendMethods(this.Class.prototype, methods);
  },
  
  
  _mixinStatic: function() {
    UltimateClone.deepExtendUltimate(this.Class, this.Parent);
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
  },


  setupModel: function(methods, collectionName) {
    if(!collectionName) {
      if(this.Parent.prototype.collection) return; //class will use parent's collection
      else collectionName = (this.className + 's').toLowerCase(); //pluralize + lowercase model name to make collection name
    }
    
    var collection; 
    
    if(_.isObject(collectionName)) collection = collectionName;
    else {
      if(_.isArray(collectionName)) {
        var collectionObjectName = collectionName[0];
        collectionName = collectionName[1]; 
      }
      else { //if(_.isString(collectionName))
        var parts = collectionName.split('_'),
          collectionObjectName = '';
          
        _.each(parts, function(part) { 
          collectionObjectName += part.capitalizeOnlyFirstLetter();
        }); 
      }
      
      if(Ultimate.globalScope[collectionObjectName]) collection = Ultimate.globalScope[collectionObjectName];
      else collection = Ultimate.globalScope[collectionObjectName] = new Meteor.Collection(collectionName);
      //eval(collectionObjectName + ' = new Meteor.Collection(' + collectionName + ')'); //assign collection within package scope
    }
    
    this._assignCollection(collection, methods);
  },
  _assignCollection: function(collection, methods) {
    methods.collection = this.Class.collection = collection;
    
    var Class = this.Class;

    collection._transform = function(doc) {
      return doc.className ? new Ultimate.classes[doc.className](doc) : new Class(doc);
    };
  },
  
  
  setupComponent: function(methods, templateName) {
    if(!templateName) return;
    
    methods.templateName = templateName || this.className; //className doubles as template name
    methods.template = Template[templateName];
  },
  
  
  setupPermissions: function(methods, modelOrCollection) {
    if(modelOrCollection) {
      methods.collection = modelOrCollection.isModel ? modelOrCollection.collection : modelOrCollection;
    }
    else {
      var modelName = this.className.replace('Permissions', '');
      methods.collection = Ultimate.classes[modelName].collection;
    }
  }
});