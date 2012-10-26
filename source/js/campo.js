$(document).ready(function() {
    rivets.configure({
        adapter: {
            subscribe: function(obj, keypath, callback) {
                if (obj instanceof Backbone.Collection) {
                    obj.on('add remove reset', function() {
                        callback(obj[keypath]);
                    });
                } else {
                    obj.on('change:' + keypath, function(m, v) {
                        callback(v);
                    });
                };
            },
            unsubscribe: function(obj, keypath, callback) {
                if (obj instanceof Backbone.Collection) {
                    obj.off('add remove reset', function() {
                        callback(obj[keypath])
                    })
                } else {
                    obj.off('change:' + keypath, function(m, v) {
                        callback(v);
                    });
                };
            },
            read: function(obj, keypath) {
                if (obj instanceof Backbone.Collection) {
                    return obj[keypath];
                } else {
                    return obj.get(keypath);
                };
            },
            publish: function(obj, keypath, value) {
                if (obj instanceof Backbone.Collection) {
                    obj[keypath] = value;
                } else {              
                    obj.set(keypath, value);
                };
            }
        }
    });

    rivets.binders.changeupdown =  {
      publishes: true,
      routine: function(el, value) {
        if (this.model._previousAttributes[this.keypath]!== undefined) {
          var up = this.model._previousAttributes[this.keypath] < value;
          var down = this.model._previousAttributes[this.keypath] > value;
          if (up == true) {
            $(el).addClass("changedUp");
            setTimeout(function(){$(el).removeClass("changedUp");}, 8000);
          } else if (down == true) {
            $(el).addClass("changedDown");
            setTimeout(function(){$(el).removeClass("changedDown");}, 8000);
          }
        }  
      }
    };

    $.ajaxSetup({ cache: false });

    var CampoModel = Backbone.Model.extend({
    }); 

    var CampoModelList = Backbone.Collection.extend({
      model: CampoModel,
      initialize: function(attributes, element) {
        this.name    = attributes.name;
        this.url     = attributes.url || "/rest/"+this.name+".json";
        this.refresh = attributes.refresh;
        this.el      = element;
        this.nested  = attributes.nested;
        if (this.refresh !== undefined && this.refresh.idattribute !== undefined) {
          var ia = this.refresh.idattribute;
          this.model = CampoModel.extend({
            idAttribute: ia
          });
        }
      },
      parse: function(response, xhr) {
        if (this.nested === undefined) {
            return response;
        } else {
            return eval("response."+this.nested);
        }
      },
      display: function() {
        var options = {async: true};
        if (this.refresh !== undefined && this.refresh.feq > 0) {
            var instance = this;
            if (instance.refresh.mode !== undefined) {
              options[instance.refresh.mode] = true;
            }
            // if (instance.refresh.idattribute !== undefined) {
            //   console.log("idattr: "+ instance.refresh.idattribute)
            //   this.idAttribute = instance.refresh.idattribute;
            // }
            setTimeout(function(){instance.display()}, instance.refresh.feq);

        }
        this.fetchOrUpdate(options);
      },
      // See: https://github.com/documentcloud/backbone/pull/446 
      // you can do in-place updates of these models, reusing existing instances.
      // - Items are matched against existing items in the collection by id
      // - New items are added
      // - matching models are updated using set(), triggers 'change'.
      // - existing models not present in the update are removed if 'removeMissing' is passed.
      // - a collection change event will be dispatched for each add() and remove()
      update : function(models, options) {
        models  || (models = []);
        options || (options = {});

        //keep track of the models we've updated, cause we're gunna delete the rest if 'removeMissing' is set.
        var updateMap = _.reduce(this.models, function(map, model){ map[model.id] = false; return map },{});

        _.each( models, function(model) {

          var idAttribute = this.model.prototype.idAttribute;
          var modelId = model[idAttribute];

          if ( modelId == undefined ) throw new Error("Can't update a model with no id attribute. Please use 'reset'.");
          
          if ( this._byId[modelId] ) {
            var attrs = (model instanceof Backbone.Model) ? _.clone(model.attributes) : _.clone(model);
            delete attrs[idAttribute];
            this._byId[modelId].set( attrs );
            updateMap[modelId] = true;
          }
          else {
            this.add( model );
          }
        }, this);

        if ( options.removeMissing ) {
          _.select(updateMap, function(updated, modelId){
            if (!updated) this.remove( modelId );
          }, this);
        }
        return this;
      },
      fetchOrUpdate : function(options) {
        options || (options = {});
        var collection = this;
        var success = options.success;
        options.success = function(resp, status, xhr) {
          collection[options.update ? 'update' : options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
          if (success) success(collection, resp);
        };
        options.error = Backbone.wrapError(options.error, collection, options);
        return (this.sync || Backbone.sync).call(this, 'read', this, options);
      }
    });

    var models_list = [];
    var model_list = [];

    $(".cmp_bind").each(function(i, c){
        var info = $(c).data("models");
        var cml = null;
        if (info !== undefined) {
            cml = new CampoModelList(info,c);
            models_list.push(cml);
        }
        info = $(c).data("model");
        if (info !== undefined) {
            cml = new CampoModel(info,c);
            model_list.push(cml);
        }
        if(cml !== null) {
            var binds = {};
            binds[cml.name] = cml;
            var view = rivets.bind(c, binds);
            cml.display();
        }
    });
});