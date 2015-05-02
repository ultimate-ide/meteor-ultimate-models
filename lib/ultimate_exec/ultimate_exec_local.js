Ultimate('UltimateExecLocal').extends({
  proxyConstruct: function(cmds, options) {
		this.commands = [].concat(cmds);
		
		options = options || {};
		if(!_.isObject(options)) options = {stdout: options};
		
		options.successCallback = options.successCallback || function() {};
		options.failCallback = options.failCallback || function() {};
		
		this.options = options;
	},
	exec: function() {
    return Npm.require('async').eachSeries(commands, this.runCommand.bind(this), this.done.bind(this));
	},


	runCommand: function(command, done) {
		var child = Npm.require('child_process').exec(command, done);
		
		child.stdout = this.options.stdout;
		child.stderr = this.options.stderr;
	},
	
	done: function(error) {
    if (error) this.options.failCallback(err);
    else this.options.successCallback();
	}
});