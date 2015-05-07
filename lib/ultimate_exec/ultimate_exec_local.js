Ultimate('UltimateExecLocal').extends({
  construct: function(cmds, options) {
		this.commands = [].concat(cmds);

		if(_.isFunction(options)) options = {onSuccess: options};
		else options = options || {};

		options.onSuccess = options.onSuccess || function() {};
		options.onFail = options.onFail || function() {};
		options.stdout = options.stdout || function() {};
		options.stderr = options.stderr || function() {};

		this.options = options;
		this._async = Npm.require('async');
		this._exec = Npm.require('child_process').exec;

		this.allOutput = '';
		this.allErrors = '';
	},
	exec: function() {
    	return this._async.eachSeries(this.commands, this.runCommand.bind(this), this.done.bind(this));
	},


	runCommand: function(command, done) {
		this._exec(command, this.options, function (error, stdout, stderr) {
			this.allOutput += _.isString(stdout) ? stdout : '';
			this.allErrors += _.isString(stderr) ? stderr : '';

    		if(error && this.options.stderr) this.options.stderr.call(this, error);
    		else if(this.options.stdout) {
    			this.options.stdout.call(this, stdout);
    			done();
    		}
		}.bind(this));
	},
	
	done: function(error, success) {
    	if (error) this.options.onFail(error, this.allErrors);
    	else this.options.onSuccess(this.allOutput);
	}
});