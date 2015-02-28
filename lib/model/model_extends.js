var globalScope = this;

Function.extend({
	modelExtends: function(Parent, collectionName, methods, isAbstract) {
		if(arguments.length === 2) {
			methods = collectionName;
			collectionName = Parent;
			Parent = UltimateModel;
		}
	
		if(_.isObject(collectionName)) var collection = collectionName;
		else {
			if(_.isArray(collectionName)) {
				var modelName = collectionName[0];
				collectionName = collectionName[1];	
			}
			else { //if(_.isString(collectionName))
				var parts = collectionName.split('_');

				var modelName = '';
				_.each(parts, function(part) {
					modelName += part[0].toUpperCase() + part.slice(1);
				});	
			}
			var collection = globalScope[modelName] = new Meteor.Collection(collectionName);
		}
	
	
		var Class = this,
			model = Class.extends(Parent, {collection: collection}, true); //add collection first so hook methods have access to it		
	
		model.__type = 'model_class_'+model.getClassName();
		model.prototype.__type = 'model_instance_'+model.getClassName();

		collection._transform = function(doc) {
		  return new model(doc);
		};
		
		methods.isAbstract = isAbstract;
		
		model.mixinStatic(Parent);
		model.extend(methods);	
		
		return model;
	}
});