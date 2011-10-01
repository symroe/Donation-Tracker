(function ($) {

  Pledge = Backbone.Model.extend({
    //Create a model to hold friend atribute
    name: null,
    amount: null
  });
  

  PledgeList = Backbone.Collection.extend({
    model: Pledge,
    localStorage: new Store("pledges_store"),
    total: function() {
         return this.reduce(function(total, model) { return total + parseInt(model.get('amount'))}, 0)
    }
  });
  
  window.Pledges = new PledgeList;
  
  window.PledgeView = Backbone.View.extend({
      tagName: "li",
      className: "pledge",
      events: {
        "click .delete-pledge": "deleteOne",
        "keypress .pledge-input"   : "updateOnEnter"
      },
      initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
          },
       render: function() {
           $(this.el).html(tim('single_pledge', this.model.toJSON()));
           $('#pledge_list').append(this.el);
           return this;
       },
       deleteOne: function(el) {
           this.model.destroy()
       },
       edit: function() {
           
       },
       updateOnEnter: function(e) {
           if (e.keyCode == 13) this.close();
       },
       close: function() {
           // console.debug(this.el)
           // console.debug($(this.el))
           $(this.el).children('input').each(function() {
               console.debug(this)
           })

           this.model.save({
               name: "asd",
               amount: "asd"
           })
       }
  });

  window.PledgesView = Backbone.View.extend({
    el: $("#pledges"),
    initialize: function () {
         _.bindAll(this, 'addOne', 'addAll');
         Pledges.bind('add', this.addOne);
         Pledges.bind('remove', this.removeOne);
         Pledges.bind('reset', this.addAll);
         Pledges.bind('all', this.updateTotal);
         
         Pledges.fetch()
    },
    events: {
      "click #add-pledge":  "submitForm",
    },
    addOne: function(pledge) {
        var view = new PledgeView({model: pledge}).render().el;
    },
    addAll: function() {
        Pledges.each(this.addOne)
    },
    removeOne: function(pledge) {
        $(pledge.view.el).remove()
    },
    submitForm: function () {
      Pledges.create({
          name: $('#pledge_name').val(),
          amount: $('#pledge_amount').val(),
      });
      $('#pledge_amount').val(Math.floor(100+Math.random()*(1000-100)));      
    },
    updateTotal: function(model) {
        $('.total').html(Pledges.total())
    },
  });

  window.App = new PledgesView;

  var Workspace = Backbone.Router.extend({

    routes: {
      "say/:message": "say",
    },
    say: function(message) {
     console.debug(message)
    },
  });
  var WP = new Workspace;
  Backbone.history.start({pushState: true})

})(jQuery);




