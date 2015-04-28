_.extend(Ultimate, {
  setupComponent: function(methods) {
    if(_.isString(methods.template) || !methods.template) {
      methods.templateName = methods.template || (this.Parent.prototype.templateName || this.className); //className doubles as template name
      methods.template = Template[methods.templateName]; //user defines template as string and we overwrite it as actual template
    }
    else if(methods.template) {
      methods.templateName = methods.template.viewName.replace('Template.');
    }
  },


  setupPermissions: function(methods) {
    if(methods.collection) return;
    if(methods.model) methods.collection = methods.model.collection;
    else {
      var modelName = this.className.replace('Permissions', '');
      methods.collection = Ultimate.classes[modelName].collection;
    }
  }
});