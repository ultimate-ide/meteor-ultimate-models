UltimateModel.extendStatic({
	with: function(relationsGroup, relationsGroup2, relationsEtc, options) {
		if(_.isString(relationsGroup)) this.addRelationsStrings.apply(this, arguments);
		else if(_.isObject(relationsGroup)) this.addRelationsObject(relationsGroup);
		
		return this;
	},
	getRelations: function() {
		return this._relations = this._relations || {};
	},
	addRelationsObject: function(relationsObject) {
		_.extend(this.getRelations(), relationsObject); //relations arg already in expected object format
	},


	addRelationsStrings: function() { //params: ('orders', 'posts.comments', options)
		var args = _.toArray(arguments),
			lastArg = args[args.length - 1],
			options = _.isObject(lastArg) ? args.pop() : null;
		
		_.each(args, function(relationsGroup, index) {
			if(index === args.length - 1) this.addGroup(relationsGroup, options); //apply options only to last relationGroup
			else this.addGroup(relationsGroup);
		});
	},
	addGroup: function(relationsString, options) { //eg: 'posts.comments'
		var rels = relations.split('.').reverse(),
			relations = {};
	
		_.each(reverseRels, function(name, index) { 
			relations[name] = {}; //1st: {comments: {}} //2nd: {with: {comments: {}}, posts: {}}
			newRelations = {};
			newRelations.with = relations; //1st: {with: {comments: {}}} //2nd: {with: {with: {comments: {}}, posts: {}}}
	
			if(index === 0) _.extend(newRelations.with[name], options); //options apply to last relation only
	
			relations = newRelations; //it works backwards so the array must be reversed to start
		});

		relations = relations.with; //convert from {with: posts: {}..} -> {posts: {}..}
		_.extend(this.getRelations(), relations); //duplicates passed to with() will overwrite, last taking priority :)
	}
});