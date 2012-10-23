$(document).ready(function() {
    rivets.configure({
        adapter: {
            subscribe: function(obj, keypath, callback) {
                if (obj instanceof Backbone.Collection) {
                    obj.on('add remove reset', function() {
                        callback(obj[keypath])
                    });
                } else {
                    obj.on('change:' + keypath, function(m, v) {
                        callback(v)
                    });
                };
            },
            unsubscribe: function(obj, keypath, callback) {
                if (obj instanceof Backbone.Collection) {
                    obj.off('add remove reset', function() {
                        callback(obj[keypath])
                    });
                } else {
                    obj.off('change:' + keypath, function(m, v) {
                        callback(v)
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

    var CampoModel = Backbone.Model.extend({
      // initialize: function(attributes, element) {
      //   this.id      = attributes.id;
      //   this.name    = attributes.name;
      //   this.url     = attributes.url || "/rest/"+this.name+"/"+this.id+".json";
      //   this.refresh = attributes.refresh;
      //   this.el      = element;
      //   this.nested  = attributes.nested;
      // }, 
      // parse: function(response, xhr) {  
      //   if (this.nested === undefined) {
      //       return response;
      //   } else {
      //       return response[this.nested];
      //   }
      // }
    }); 

    var CampoModelList = Backbone.Collection.extend({
      model: CampoModel,
      initialize: function(attributes, element) {
        this.name    = attributes.name;
        this.url     = attributes.url || "/rest/"+this.name+".json";
        this.refresh = attributes.refresh;
        this.el      = element;
        this.nested  = attributes.nested;
      },
      parse: function(response, xhr) {
        if (this.nested === undefined) {
            return response;
        } else {
            return response[this.nested];
        }
      },
      display: function() {
        console.log("Display: "+this.name);
        this.fetch({async: true});
        if (this.refresh !== undefined && this.refresh.feq > 0) {
            var instance = this;
            setTimeout(function(){instance.display()}, instance.refresh.feq);
        }
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



    // this should be searched through the DOM
    

    // var models = new CampoModelList();

    // var countries_tmpl2 = get_template("#countries_2");
    // var view_demo2 = rivets.bind(countries_tmpl2, { country_list: models });

    // var updater = function(){
    //     console.log("updating");
    //     models.fetch({async: true});
    //     setTimeout(function(){updater()}, 2500);
    // };

    // updater();


});