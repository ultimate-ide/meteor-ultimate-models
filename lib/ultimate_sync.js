Future = Npm.require('fibers/future');

UltimateSync = {};

UltimateSync.makeSync = function(context, method) {
  return function (/* arguments */) {
  	var fn = context[method],
			newArgs = _.toArray(arguments),
			callback;

    for (var i = newArgs.length - 1; i >= 0; --i) {
      var arg = newArgs[i];
      var type = typeof arg;
      if (type !== "undefined") {
        if (type === "function") {
          callback = arg;
        }
        break;
      }
    }

    if(!callback) {
      var fut = new Future();
			callback = function(error, data) {
			  fut.return({error:  error, data: data});
			};
			
      ++i; 
    }

    newArgs[i] = Meteor.bindEnvironment(callback);
    var result = fn.apply(context, newArgs);
    return fut ? fut.wait() : result;
  };
};


UltimateSync.applySync = function(context, method, argsArray) {
  var syncFunc = UltimateSync.makeSync(context, method);
	return syncFunc.apply(context, argsArray);
};


//ADD HTTP AS DEPENDENCY
UltimateSync.post = function() {
	return UltimateSync.applySync(HTTP, 'post', arguments);
};

UltimateSync.get = function() {
	return UltimateSync.applySync(HTTP, 'get', arguments);
};

UltimateSync.put = function() {
	return UltimateSync.applySync(HTTP, 'put', arguments);
};

UltimateSync.del = function() {
	return UltimateSync.applySync(HTTP, 'del', arguments);
};