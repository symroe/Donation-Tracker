(function ($) {

  Pledge = Backbone.Model.extend({
    //Create a model to hold friend atribute
    name: null,
    amount: null,
    amount_formatted: null,
    validate: function(attrs) {
        if (!parseFloat(attrs.amount)) {
            return "NAN";
        }
    }
  });
  

  PledgeList = Backbone.Collection.extend({
    model: Pledge,
    localStorage: new Store("pledges_store"),
    total: function(project_id) {
        total = this.forProject(project_id).reduce(function(total, model) { return total + parseInt(model.get('amount'))}, 0)
        Projects.get(project_id).set({total : total})
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
        "dblclick": "edit",
        "keypress .pledge-input"   : "updateOnEnter",
        "keypress input"   : "updateOnEnter"
      },
        initialize: function(model) {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.bind('error', this.error);
            this.model.view = this;
        },
       error: function() {
           // alert('asd')
       },
       render: function() {
           m = this.model.toJSON()
           m['amount_formatted'] = CommaFormatted(this.model.get("amount"))
           // this.model.set({'amount_formatted' : CommaFormatted(this.model.get("amount"))})
           // console.debug(this.model.toJSON())
           $(this.el).html(tim('single_pledge', m));
           return this;
       },
       deleteOne: function(el) {
           this.model.destroy()
           $(this.el).remove()
           return false;
       },
       edit: function() {
           $(this.el).addClass('editing')
           $(this.el).find('input[name=name]').focus();
       },
       updateOnEnter: function(e) {
           if (e.keyCode == 13) this.close();
       },
       close: function() {
           name = $(this.el).find('input[name=name]')[0].value
           amount = $(this.el).find('input[name=amount]')[0].value
           this.model.save({
               name: name,
               amount: amount
           })
           this.render()
           $(this.el).removeClass('editing')
           $(this.el).find('.pledge_edit_form').hide();
       }
  });

})(jQuery);




