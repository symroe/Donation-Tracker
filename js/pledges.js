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
       },
       edit: function() {
           
       },
       updateOnEnter: function(e) {
           if (e.keyCode == 13) this.close();
       },
       close: function() {

           name = $(this.el).children('input[name=name]')[0].value
           amount = $(this.el).children('input[name=amount]')[0].value
           // console.debug(this)
           this.model.save({
               name: name,
               amount: amount
           })
       }
  });

  // window.PledgesForProjectView = Backbone.View.extend({
  //   tag: 'section',
  //   class: 'PledgeView',
  //   el: $(".project"),
  //   initialize: function (project) {
  //        _.bindAll(this, 'render', 'addOne', 'addAll');
  //        this.model.pledges.bind('change', this.render);
  //        this.model.view = this;
  // 
  //        // this.model.pledges.bind('add', this.addOne);
  //        this.model.pledges.bind('remove', this.removeOne);
  //        // this.model.pledges.bind('reset', this.addAll);
  //        // this.model.pledges.bind('all', this.updateTotal);
  //        // this.project = project
  //        this.model.pledges.fetch()
  //   },
  //   events: {
  //     "click .add-pledge":  "submitForm",
  //   },
  //   render: function() {
  //       $(this.el).children('.project_pledges').html(tim('pledge_form', this.model.toJSON()))
  //   },
  //   addOne: function(pledge) {
  //       console.debug('called')
  //       view = new PledgeView({model: pledge, project: this.model}).render().el
  //       $(this.el).find('.pledge_list').append(view)
  //   },
  //   addAll: function() {
  //       this.model.pledges.each(this.addOne)
  //   },
  //   removeOne: function(pledge) {
  //       $(pledge.view.el).remove()
  //   },
  //   submitForm: function () {
  //       x = this.model.pledges.create({
  //           name: $(this.el).find('.pledge_name').val(),
  //           amount: $(this.el).find('.pledge_amount').val(),
  //       });
  //       $(this.el).children('.pledge_amount').val(Math.floor(100+Math.random()*(1000-100)));      
  //   },
  //   updateTotal: function() {
  //       console.debug(this)
  //       $(this.el).find('.total').html(this.total())
  //   },
  // });

})(jQuery);




