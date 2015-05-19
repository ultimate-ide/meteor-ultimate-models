UltimateModel.extendStatic({
	with: function(relationsGroup, relationsGroup2, relationsEtc, options) {
		if(_.isString(relationsGroup)) this.addRelationsArray(_.toArray(arguments));
		else if(_.isObject(relationsGroup)) _.extend(this.getRelations(), relationsObject); //relations arg already in expected object format
		
		console.log("RELATIONS OBJECT", this.getRelations());
		return this;
	},
	getRelations: function() {
		return this._relations = this._relations || {};
	},


	addRelationsArray: function(args) { //args == ['orders', 'posts.comments', options]
		var	options = _.lastObjectFromArguments(args); //only pops options object, if available, otherwise null
	
		_.each(args, function(relationsGroup, index) {
			var lastRelationGroupOptions = index === args.length-1 ? options : null;
			this.addGroup(relationsGroup, lastRelationGroupOptions); //apply options only to last relationGroup
		}, this);
	},
	addGroup: function(relationsString, options) { //eg: 'posts.comments'
		var rels = relationsString.split('.'),
			relations = {}
			lastRelation;

		_.reduce(rels, function(relations, name) { 
			relations.with = {};
			return relations.with[name] = lastRelation = {};
		}, relations);

		_.extend(lastRelation, options); //options apply to last relation only
		relations = relations.with


		//Instead of _.extend(this.getRelations(), relations), we combine them so that
		//if the same relation appears 2x+, any 'with' relations of its own are combined 
		//eg: 'instances.payments' and 'instances.orders' becomes:
		//{instances: {with: {payments: {}, orders: {}}}}
		var rel = this.getRelations();
		_.each(relations, function(obj, name) { 
			var current = rel[name];

			if(current && obj.with) {
				if(!current.with) current.with = {};
				_.extend(current.with, obj.with);
			}
			else current = rel[name] = obj;

			rel = current; //progress deeper into getRelations object, looking for next set of already existing 'with' objects
		});
	}
});