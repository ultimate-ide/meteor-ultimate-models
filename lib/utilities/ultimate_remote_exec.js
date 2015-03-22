Ultimate('UltimateRemoteExec').extends({
	construct: function(hosts, cmds, options, successCallback, failCallback) {
		this.exec = Npm.require('remote-exec');
		this.fs = Npm.require('fs');
		
		this.hosts = [].concat(hosts)
		this.commands = [].concat(cmds);
		this.options = options || {};
		this.successCallback = successCallback || function() {};
		this.failCallback = failCallback || function() {};
	},
	
	set: function(k, v) {
		this.options[k] = v;
	},
	
	getOptions: function() {
		var options = _.clone(this.options);
		
		if(options.stdout) options.stdout = {write: options.stdout};
		if(options.stderr) options.stderr = {write: options.stderr};
		if(options.privateKey) options.privateKey = fs.readFileSync(options.privateKey);
		
		return options;
	},
	exec: function() {
		this.exec(this.hosts, this.commands, this.getOptions(), function(err) {
		    if (err) this.failCallback(err);
		    else this.successCallback();
		}.bind(this));
	}
});



 

