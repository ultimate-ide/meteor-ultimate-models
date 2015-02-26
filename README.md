#meteor-ultimate-models

**Credits**: This package has be created by James Gillmore (@facespacey), Charanjit Singh (@channikhabra), and Matheus Simons (@matheus90). 

### Why this name?
Because Meteor doesn't sponsor any particular model or class/inheritance system, and this one sure is ultimate! There are a lot of features unique to Meteor which we're sure you will love.

### Why this package?
Meteor is cool. Mongo is awesome. But Models in MVC frameworks are great at code re-usability. This package makes it easy to get rid of helpers and other boilerplate code and push more code into classes and models. 

### How to install?
```sh
meteor add ultimateide:ultimate-models
```

## How to use?
```
StripeCharge = function StripeCharge() {};

StripeCharge.extends(UltimateClass, {
	create: function() {}
});

Order = function Order() {};

Order.modelExtends(UltimateModel, 'orders', { //'Orders' collection will be created as an object in the global scope
	getPrice: function() {}
});
```

### API
Explore it. Start with `lib/model/ultimate_model.js` since most of you will start with the goal of a better implementation for models generated from `collection._transform`. But there's a lot A LOT more, which we'll soon document.

Ok, let me give you some examples (VERY OUTDATED!):  

* **Create a Model aka Convert collection to model**
  ```javascript
      Todos = new Meteor.Collection("todos");
      Todo = Model(Todos);
  ```
* **Add default values for new todos**
  ```js
    Todo.extend({
        defaultValues: {
          title: "Please give a title"
        }
    })
  ```
* **Add helper functions to model**
  ```js
    Todo.extend({
        defaultValues: {
          //explained above
        },
        getTitle: function() {
        
        }
    })
  ```


###NOTE:
This package doesn't do some magic or add extra functionality to collections besides intetration of the popular hooks pacakge. It just make it easy and obvious to write re-usable code and provide some helpers like `save()`, `update()` to make your lives easier. So basically it aims to improve code re-usability and readability and it does a fairly good job in it.
