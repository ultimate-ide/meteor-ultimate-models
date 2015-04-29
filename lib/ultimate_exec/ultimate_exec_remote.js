Ultimate('UltimateExecRemote').extends({
	proxyConstruct: function(cmds, options, hosts) {
		this._execRemote = Npm.require('remote-exec');

		this.hosts = [].concat(hosts)
		this.commands = [].concat(cmds);

		options = options || {};
    options.successCallback = options.successCallback || function() {};
    options.failCallback = options.failCallback || function() {};

    if(options.stdout) options.stdout = {write: options.stdout};
    if(options.stderr) options.stderr = {write: options.stderr};
    if(options.privateKey) options.privateKey = Npm.require('fs').readFileSync(options.privateKey);

    this.options = options;
	},
  exec: function() {
    return this._execRemote(this.hosts, this.commands, this.options, function(err) {
      if (err) this.options.failCallback(err);
      else this.options.successCallback();
    }.bind(this));
  }
});



 

