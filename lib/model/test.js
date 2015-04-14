User
	.with('orders', 'orders.payments')
	.agg('orderCount', 'moneySpent')
	.keep()
	.subscribe('self'); //returns custom object with .ready() method that checks agg + relation publisher ready()

User.self();
users = User.recentUsers(selector, options);

_.each(users, function(user) {
	user.orders();
	user.orderCount();
	user.moneySpent();
});

Ultimate('User').extends(UltimateModel, 'users', {
	subscriptions: {
		self: function() {
			return Users.find(this.userId);
		},
		recentUsers: {
			selector: {status: active},
			sort: {date_created: -1},
			limit: 10,
			with: {
				posts: {
					limit: 10,
					with: {
						comments: {}
					}
				}
			},
			aggregates: ['moneySpent', 'count'],
			with: ['orders', 'posts.comments']
		}
	},
	relations: {
		orders: {
			relation: 'through',
			model: Order,
			foreign_key: 'user_id',
			options: {
				selector: {paid: true},
				sort: {date_created: -1},
				limit: 10
			},
			aggregates: ['moneySpent', 'count'] //automatically apply moneySpent to User's here
		},
		orders: {
			relation: 'many_to_many',
			model: Comment,
			through: UserComment, //UserComments, 'user_comments'
			foreign_key: ['user_id', 'comment_id'],
			throughOptions: {},
			options: {
				selector: {paid: true},
				sort: {date_created: -1},
				limit: 10
			},
			aggregates: ['moneySpent', 'count'] //automatically apply moneySpent to User's here
		},
		profile: {
			relation: 'belongs_to',
			model: Profile,
			foreign_key: 'profile_id'
		}
	} 
});



Ultimate('Order').extends(UltimateModel, 'orders', {
	aggregates: {
		moneySpent: {
			field: 'price_paid',
			operator: 'sum',
			selector: {refunded: false}
		},
		orderCount: {
			operator: 'count',
			selector: {refunded: false},
			reactive: false
		}
	},
	relations: {
		user: ['belongs_to', User, 'user_id'],
		comments: ['has_many', Post, 'user_id']
	}
}); 


//GROUP BY SUB
City
	.with('orders')
	.subscribe('mostPopular');

cities = Order.groupBy(City).moneySpent();


Ultimate('City').extends(UltimateModel, 'cities', {
	subscriptions: {
		mostPopular: {
			limit: 10
		}
	},
	relations: {
		orders: {
			relation: 'has_many',
			model: Order,
			foreign_key: 'city_id',
			aggregates: ['moneySpent']
		}
	}
});


totalSpent = Order.moneySpent();
cities = Order.groupBy(City).moneySpent(); //city models cursor
cities = Order.groupBy('city').moneySpent(); //array of arrays: [['new york', 20], ['los angeles', 80]]
cities = Order.groupBy(City).sum('price_paid', selector, options, function() {}); //use Meteor.call, no sub

//another OPTION:
cities = City.agg(Order).moneySpent();
cities = City.agg(Order).sum('price_paid', selector, options);


//GROUP BY SUB
City
	.with('orders')
	.subscribe('mostPopular');

cities = Order.groupBy(City).moneySpent();


//SUBSCRIPTION
User
	.with('orders', 'orders.payments')
	.count()
	.sum('price_paid', selector)
	.avg('price_paid', selector, options)
	.keep()
	.cache()
	.subscribe('self'); //returns custom object with .ready() method that checks agg + relation publisher ready()
	
	
	_createAggregateMethod: function(name, agg, rel) {
		this.___proto[name] = function(callback) {
			agg.collection = rel.model.collection()._name;
			agg.model = this.className;
			agg.fk = this._id;
			
			var aggExec = _.extend({}, agg, {selector: {fk: this._id}}),
				exec = UltimateAggregateRelationsPublisher.prototype.exec;
				
			if(Meteor.isServer) return exec(aggExec, rel.model.collection(), true).result;
			else if(callback) Meteor.call('execAggregate', aggExec, rel.model.className, true, function(err, res) {
				if(!err) callback(res);
				else throw new Meteor.Error('aggregate-error', 'Async aggregate request failed.');
			});
			else {
				var res =  UltimateAggregates.find(agg, {sort: {updated_at: -1}}).fetch(), //agg obj doubles as mongo selector
					latestAggValue = res.shift();
				
				_.each(res, function(agg) {
					UltimateAggregates._collection.remove(agg._id); //remove old ones from browser localstorage
				});
				
				return res ? latestAggValue.result : 0;
			}
		}.bind(this);
	}
	
	User.with({
		orders: {
		
		},
		profile: {
		
		}
	}).subscribe('self');


	User
		.with({orders: { }})
		.with({profile: { }})
		.with({
			posts: { 
				selector: {paid: true},
				with: {
					comments: { limit: 10}
				}
			},
			orders: {limit: 10, sort: U.$createdAsc}
		})
		.subscribe('self');
	
	
	
	
		Ultimate('UltimateAggregateRelationshipPublisher').extends({
			construct: function(publisher, aggregates, ModelClass, relation, ParentModelClass) {
				this.publisher = publisher;
				this.aggregates = aggregates;
				this.modelClass = ModelClass;
				this.relation = relation;
				this.parentModelClass = ParentModelClass;
			},
			observe: function(selector) {
				this.collection.find(selector, {limit: 1, sort: {updated_at: -1}}).observe({
					added: function() {
						this.exec();
					}.bind(this),
					change: function() {
						this.exec();
					}.bind(this),
					removed: function() {
						this.exec();
					}.bind(this),
				});
			},
			process: function() {
				var result = this.exec(operator, field, selector).result;
		
				_.each(result, function(obj) {
					this.store(obj);
				}, this);
			},
			store: function(agg) {
				agg.fk = agg._id;
				delete agg._id;
		
				agg.model = this.parentModelClass.className;
		
				if(agg.fk) {
					agg.group_model = this.modelClass.className;
					agg.type = 'group';
				}
				else agg.type = 'collection';
		
				agg = new UltimateAggregate(agg);
				agg.save();
		
				Class.prototype[name] = function() {
					return Aggregates.find({
						model: Class.className,
						type: type,
						selector: selectorString,
						fk: this._id,
						group_model: this.className
					});
				};
		
		
				Class.prototype[name] = function() {
					return Aggregates.find({
						model: Class.className,
						type: type,
						selector: selectorString
					});
				};
			},
			one: function() {
				return this.exec(operator, field, selector).result;
			},
			many: function() {
		
			},
			exec: function(operator, field, selector, fk) {
				var group = {};
		
				group._id = fk ? '$'+fk : null;
				group.result = {};
				group.result['$'+operator] = '$'+field;
			
				var	pipeline = [{$group: group}]; 
		
				if(selector) pipeline.unshift({$match: selector});
		
				this.collection.aggregate(pipeline);
			},
			createMethods: function(ParentClass, Class, type, selectorString) {
				ParentClass.prototype[name] = function() {
					return Aggregates.find({
						model: Class.className,
						type: type,
						selector: selectorString,
						fk: this._id,
						group_model: this.className
					});
				};
		
		
				ParentClass.prototype[name] = function() {
					if(Meteor.isServer) return self[name]();
					else if(callback) callback.call(this, self[name]());
					else {
						return Aggregates.find({
							model: ParentClass.className,
							type: type,
							selector: selectorString
						});
					}
				};
			}
		});


		Order.moneySpent();
		
		
String.prototype.capitalizeOnlyFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

function convertObjectToSimpleSchema(obj) {
	var schema = {};

	_.each(json, function(v, prop) { 
		schema[prop] = {};
		schema[prop].label = prop; //label for form
		schema[prop].type = window[(typeof v).capitalizeOnlyFirstLetter()]; //will be required, and required to be this type
	});
	
	return new SimpleSchema(schema);
}


var mupDoc = {num: 6, name: 'King Charan', environment: 'production'}; //mupDoc should be the return of EJSON.parse(mup.json)

var ss = convertObjectToSimpleSchema(mupDoc); //now you can do {{>quickform schema=ss doc=mupDoc}}
			
			
	Meteor.publishWithRelations = function(params) {
	  var associations, collection, collectionHandle, doMapping, filter, options, pub, publishAssoc;
	  pub = params.handle;
	  collection = params.collection;
	  associations = {};
		
		
	  publishAssoc = function(collection, filter, options) {
	    return collection.find(filter, options).observeChanges({
	      added: (function(_this) {
	        return function(id, fields) {
	          return pub.added(collection._name, id, fields);
	        };
	      })(this),
	      changed: (function(_this) {
	        return function(id, fields) {
	          return pub.changed(collection._name, id, fields);
	        };
	      })(this),
	      removed: (function(_this) {
	        return function(id) {
	          return pub.removed(collection._name, id);
	        };
	      })(this)
	    });
	  };
		
		
	  doMapping = function(id, obj, mappings) {
	    var i, len, mapFilter, mapOptions, mapping, objKey, ref, results;
	    if (!mappings) {
	      return;
	    }
	    results = [];
	    for (i = 0, len = mappings.length; i < len; i++) {
	      mapping = mappings[i];
	      mapFilter = {};
	      mapOptions = {};
	      if (mapping.reverse) {
	        objKey = mapping.collection._name;
	        mapFilter[mapping.key] = id;
	      } else {
	        objKey = mapping.key;
	        mapFilter._id = obj[mapping.key];
	        if (_.isArray(mapFilter._id)) {
	          mapFilter._id = {
	            $in: mapFilter._id
	          };
	        }
	      }
	      _.extend(mapFilter, mapping.filter);
	      _.extend(mapOptions, mapping.options);
	      if (mapping.mappings) {
	        results.push(Meteor.publishWithRelations({
	          handle: pub,
	          collection: mapping.collection,
	          filter: mapFilter,
	          options: mapOptions,
	          mappings: mapping.mappings,
	          _noReady: true
	        }));
	      } else {
	        if ((ref = associations[id][objKey]) != null) {
	          ref.stop();
	        }
	        results.push(associations[id][objKey] = publishAssoc(mapping.collection, mapFilter, mapOptions));
	      }
	    }
	    return results;
	  };
		
		
	  filter = params.filter;
	  options = params.options;
		
		
	  collectionHandle = collection.find(filter, options).observeChanges({
	    added: function(id, fields) {
	      pub.added(collection._name, id, fields);
	      if (associations[id] == null) {
	        associations[id] = {};
	      }
	      return doMapping(id, fields, params.mappings);
	    },
	    changed: function(id, fields) {
	      _.each(fields, function(value, key) {
	        var changedMappings;
	        changedMappings = _.where(params.mappings, {
	          key: key,
	          reverse: false
	        });
	        return doMapping(id, fields, changedMappings);
	      });
	      return pub.changed(collection._name, id, fields);
	    },
	    removed: function(id) {
	      var handle, i, len, ref;
	      ref = associations[id];
	      for (i = 0, len = ref.length; i < len; i++) {
	        handle = ref[i];
	        handle.stop();
	      }
	      return pub.removed(collection._name, id);
	    }
	  });
		
		
	  if (!params._noReady) {
	    pub.ready();
	  }
		
		
	  return pub.onStop(function() {
	    var association, handle, id, key;
	    for (id in associations) {
	      association = associations[id];
	      for (key in association) {
	        handle = association[key];
	        handle.stop();
	      }
	    }
	    return collectionHandle.stop();
	  });
	};
	
	
	function totalForArray(currentTotal, arr) {
	  currentTotal += currentTotal === undefined ? 0 : arr[0]; 
	  var remainingList = arr.slice(1);

	  return remainingList.length === 0 ? currentTotal : totalForArray(currentTotal, remainingList); 
	}
	
	
	function reduce(func, arr, acc) {
		acc = acc === undefined ? 0 : func(acc, arr[0]);
	  arr = arr.slice(1);

	  return arr.length === 0 ? acc : reduce(func, arr, acc); 
	}
	
	reduce(function(total, curVal) {
		return total + curVal;
	});
	
	
	
	
	