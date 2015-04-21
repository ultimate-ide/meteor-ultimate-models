InheritanceHelper.extend({
	setupModel: function(methods, collectionName) {
		if(!collectionName) {
			if(this.Parent.prototype.collection) return; //class will use parent's collection
			else collectionName = (this.className + 's').toLowerCase(); //pluralize + lowercase model name to make collection name
		}
		
		var collection; 
		
		if(_.isObject(collectionName)) collection = collectionName;
		else {
			if(_.isArray(collectionName)) {
				var collectionObjectName = collectionName[0];
				collectionName = collectionName[1];	
			}
			else { //if(_.isString(collectionName))
				var parts = collectionName.split('_'),
					collectionObjectName = '';
					
				_.each(parts, function(part) { 
					collectionObjectName += part.capitalizeOnlyFirstLetter();
				});	
			}
			
			if(globalScope[collectionObjectName]) collection = globalScope[collectionObjectName];
			else collection = globalScope[collectionObjectName] = new Meteor.Collection(collectionName);
			//eval(collectionObjectName + ' = new Meteor.Collection(' + collectionName + ')'); //assign collection within package scope
		}
		
		this.assignCollection(collection, methods);
	},
	assignCollection: function(collection, methods) {
		methods.collection = this.Class.collection = collection;
		
		collection._transform = function(doc) {
		  return doc.className ? new Ultimate.classes[doc.classname](doc) : new this.Class(doc);
		}.bind(this);
	},
	
	
	setupComponent: function(methods, templateName) {
		if(!templateName) return;
		
		methods.templateName = templateName || this.className; //className doubles as template name
		methods.template = Template[templateName];
	},
	
	
	setupPermissions: function(methods, modelOrCollection) {
		if(modelOrCollection) {
			methods.collection = modelOrCollection.isModel ? modelOrCollection.collection : modelOrCollection;
		}
		else {
			var modelName = this.className.replace('Permissions', '');
			methods.collection = Ultimate.classes[modelName].collection;
		}
	}
});