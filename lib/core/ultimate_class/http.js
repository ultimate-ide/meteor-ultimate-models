var GlobalScope = this;

UltimateClass.extend({
	transformClient: function() { 
		this.__type = this.__type; //tack these props from the prototype on the actual instance
		this.className = this.className; //so they will be stringified below
		
		try {
			var str = EJSON.stringify(this);
		}
		catch(e) {
			var msg = 'MOST LIKELY A CIRCULAR REFERENCE ISSUE. ';
			msg += 'YOU CANNOT COMPOSE OBJECTS OF OBJECTS THAT REFERENCE THE INITIAL COMPOSER, ETC. SORRY.'
			throw new Meteor.Error('circular-reference', msg);
		}
		
		var obj = EJSON.parse(str); //deep copy while removing functions; may not be needed since Meteor.call may handle it
		
		delete obj.___dep;
		delete obj._local;
		return obj;
	},
	transformServer: function(clientObj) {
		function iterate(obj, serverObj) {
		    for(var prop in obj) {
          if(obj[prop].__type)  { //instance extended from our classes
						var className = obj[prop].className,
							newObj = new GlobalScope[className]('no_params');
			
						serverObj[prop] = newObj.transformServer(obj[prop]); //recursively transform this nested instance
          } 
					else {
						if(typeof obj[prop] == "object") serverObj[prop] = iterate(obj[prop], {}); //standard objects
						else serverObj[prop] = obj[prop]; //basic types
					}
		    }
				return serverObj;
		}	
		
		return iterate(clientObj, this);
	}
});