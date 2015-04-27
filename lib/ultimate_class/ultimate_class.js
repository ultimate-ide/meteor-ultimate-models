UltimateClass = function UltimateClass() {};

_.extend(UltimateClass, {
  __type: 'class_UltimateClass',
  isStatic: true,
  getPrototype: function() {
    return this.prototype;
  }
});


_.extend(UltimateClass.prototype, {
  __type: 'instance_UltimateClass',
  isUltimatePrototype: true,
  getPrototype: function() {
    return this.___proto;
  }
});

_.extendMultiple([UltimateClass, UltimateClass.prototype], {
  parent: null,
  className: 'UltimateClass',
  construct: UltimateClass,
  abstract: true,
  isUltimate: true,

  is: function(type) {
    var isType = 'is'+type.capitalizeFirstLetter();
    return this.getPrototype()[isType];
  },
  isClassName: function(className) {
    return this.className == className;
  },
  isChildOf: function(className) {
    function checkParent(Class) {
      if(Class.parent && Class.parent.className == className) return true;
      else if(Class.parent) return checkParent(Class.parent);
      else return false;
    }

    return checkParent(this);
  },
  isAbstract: function() {
    return this.getPrototype().hasOwnProperty('abstract');
  },
  isClassCreated: function() {
    return this.getPrototype().hasOwnProperty('classCreated');
  },
  protoHasOwnProperty: function(prop) {
    return this.getPrototype().hasOwnProperty(prop);
  },
  isPrivateMethod: function(prop) {
    return prop.indexOf('_') === 0;
  },
  usesReservedWord: function(prop) {
    return Ultimate.reservedWordsRegex.test(prop);
  },


  callParent: function(methodName) {
    var args = _.toArray(arguments),
      methodName = args.shift();

    return this._resolveParentMethod(methodName).apply(this, args);
  },
  applyParent: function(methodName, args) {
    return this._resolveParentMethod(methodName).apply(this, args);
  },

  callParentConstructor: function() {
    return this._resolveParentMethod('construct').apply(this, arguments);
  },
  applyParentConstructor: function(args) {
    return this._resolveParentMethod('construct').apply(this, args);
  },
  _resolveParentMethod: function(methodName) {
    if(this.protoHasOwnProperty(methodName)) return this.parent[methodName];
    else {
      var parentMethod = null,
        parent = this.parent;

      while(!parentMethod && parent) { //allow for using the Template Design Pattern, so inherited methods can call true parents
        if(parent.protoHasOwnProperty(methodName)) parentMethod = parent[methodName];
        parent = parent.parent;
      }

      return parentMethod;
    }
  }
});




