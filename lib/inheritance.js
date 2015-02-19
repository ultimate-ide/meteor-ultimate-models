(function(globalScope){
		var initializing = false;
		
		if(typeof process != 'undefined') __meteor_runtime_config__.MODE = process.env.NODE_ENV;
		
		function prepStringForEval(func, ClassName) {
			var toBeEvaled = func.toString();
			toBeEvaled = toBeEvaled.substring(toBeEvaled.indexOf('var newKlass'), toBeEvaled.length-1);
			return toBeEvaled.replace(/Class/g, ClassName);
		};
				
    // Create a new Class that inherits from this class
  	Function.prototype.extends = function(Parent, methods) {	
      initializing = true; //Instantiate a base class,
      var prototype = new globalScope[Parent.className]; //but only create the instance,
      initializing = false; //don't run the init constructor
			
			var ClassName = this.getClassName(), //used for replacing 'Class' below & creating named function
				originalConstructor = this.prototype.constructor, //will be used like Resig's original 'init'
				returnedKlass; //defined in this scope so we can assign the evaled result to it
			
			//inherit parent constructor if no construction code is provided
			var parensIndex = originalConstructor.toString().indexOf(')'),
				constructor = originalConstructor.toString().substr(parensIndex).replace(/ /g, ''), //eg: '){}'
				constructorIsEmpty = constructor == '){}' ? true : false,
				isDescendantOfModel = Parent.className == 'Model' || Parent.__type.indexOf('model_') === 0;
			
			if(__meteor_runtime_config__.MODE === 'development') {
				function toBeMadeString() {
		      //Class will be returned & instantiated by client code
		      var newKlass = function Class() {
		        //construction performed by originalConstructor after, but only after all this initial setup
						if(initializing) return;
						
						this.___dep = new Tracker.Dependency;
						
						var args = _.toArray(arguments);
						if(args[0] == 'no_params') return; //this object will be populated in extendHTTP code
						
						if(constructorIsEmpty) Parent.construct.apply(this, args)
						else {
							if(isDescendantOfModel) Model.construct.apply(this, args);
							originalConstructor.apply(this, args); //call the original constructor
						}
		      }
					returnedKlass = newKlass;
	      }
			
				//replace 'Class' with the original name of the named function constructor
				var toBeEvaled = prepStringForEval(toBeMadeString, ClassName);
				eval(toBeEvaled);
				var Class = returnedKlass; //replace the original Class
			}
			else { //use the version that doesn't include Eval but doesn't have Named functions
				function Class() {
	        //construction performed by originalConstructor after, but only after all this initial setup
					if(initializing) return;
					
					this.___dep = new Tracker.Dependency;
					
					var args = _.toArray(arguments);
					if(args[0] == 'no_params') return; //this object will be populdated in extendHTTP code
					
					if(constructorIsEmpty) Parent.construct.apply(this, args)
					else {
						if(isDescendantOfModel) Model.construct.apply(this, args);
						originalConstructor.apply(this, args); //call the original constructor
					}
	      }
			}
			
      Class.prototype = prototype; //Populate our constructed prototype object	
			this.__extend(Class.prototype, methods); //i wish it was just this simple ;)
			
      Class.prototype.constructor = Class; //Enforce constructor to be what we expect
			Class.prototype.class = Class; //but also put it here so we can use more "class-like" terminology
			Class.prototype.parent = Parent.prototype; //make it so we can call parent method
			Class.prototype.construct = originalConstructor;
			Class.prototype.className = ClassName;
			Class.prototype.__type = 'instance_'+ClassName;
			Class.prototype.___proto = Class.prototype;
			
			Class.parent = Parent;
			Class.className = ClassName;
			Class.__type = 'class_'+ClassName;
			Class.construct = originalConstructor;
			
			if(ClassName == 'Model') return Model = Class;
      else return globalScope[ClassName] = Class; //replace the original var in the global scope
    };
})(this);