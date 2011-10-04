(function ($) {

  Pledge = Backbone.Model.extend({
    //Create a model to hold friend atribute
    name: null,
    amount: null,
    validate: function(attrs) {
        // console.debug(attrs)
        
        // console.debug(attrs.amount)
        // console.debug(!parseFloat(attrs.amount))
        if (!parseFloat(attrs.amount)) {
            return "NANasd";
        }
        // if attrs.amount
    }
  });
  

  PledgeList = Backbone.Collection.extend({
    model: Pledge,
    localStorage: new Store("pledges_store"),
    total: function(project_id) {
        total = this.forProject(project_id).reduce(function(total, model) { return total + parseInt(model.get('amount'))}, 0)
        return total
    },
    forProject: function(project_id) {
        return _(this.filter(function(m) {
            return m.get('project') == project_id
        }))
    }
  });
  
  window.PledgeView = Backbone.View.extend({
      tagName: "li",
      className: "pledge",
      events: {
        "click .delete-pledge": "deleteOne",
        "keypress .pledge-input"   : "updateOnEnter"
      },
        initialize: function(model) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('error', this.error);
            this.model.view = this;
        },
       error: function() {
           alert('asd')
       },
       render: function() {
           $(this.el).html(tim('single_pledge', this.model.toJSON()));
           return this;
       },
       deleteOne: function(el) {
           this.model.destroy()
           $(this.el).remove()
           return false;
       },
       edit: function() {
           
       },
       updateOnEnter: function(e) {
           if (e.keyCode == 13) this.close();
       },
       close: function() {

           name = $(this.el).children('input[name=name]')[0].value
           amount = $(this.el).children('input[name=amount]')[0].value
           this.model.save({
               name: name,
               amount: amount
           })
       }
  });

})(jQuery);




