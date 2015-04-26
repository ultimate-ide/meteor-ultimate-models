Ultimate = function Ultimate(className) {
	Ultimate.className = className;
	return Ultimate;
};

Ultimate.classes = {};
Ultimate.collections = {};

if(typeof process != 'undefined')  __meteor_runtime_config__.MODE = process.env.NODE_ENV;
Ultimate.mode = __meteor_runtime_config__.MODE;

if(typeof process != 'undefined')  __meteor_runtime_config__.ROOT_URL = process.env.ROOT_URL;
Ultimate.rootUrl = __meteor_runtime_config__.ROOT_URL;