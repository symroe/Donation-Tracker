(function ($) {
    Project = Backbone.Model.extend({
        project_id: null,
        name: null,
        target_amount: 500,
        total: 0,
        defaults: {
            target_amount: 3000,
            total: 0,
        }
    });
    
    ProjectList = Backbone.Collection.extend({
        model: Project,
        localStorage: new Store("project_store"),
        
    });

    window.Projects = new ProjectList;

    window.SingleProjectView = Backbone.View.extend({
        tagName: "section",
        className: "project",
        initialize: function(model) {
            _.bindAll(this, 'render', 'addOne', 'addAll', 'graph');

            this.model.view = this;
            this.model.pledges = new PledgeList(this)

            this.model.pledges.bind('change', this.updateTotal, this);
            this.model.pledges.bind('change', this.updateGraph, this);
            this.model.pledges.bind('destroy', this.updateTotal, this);
            this.model.pledges.bind('reset', this.render);
            this.model.bind('reset', this.updateTotal);
            this.model.pledges.bind('reset', this.addAll);
            // this.model.pledges.bind('reset', this.addGraph, this);
            this.model.pledges.bind('add', this.addOne);
            this.model.pledges.bind('add', this.updateGraph, this);
            this.model.pledges.bind('destroy', this.updateGraph, this);

            this.model.pledges.fetch()
        },
        events: {
            "click .add-pledge":  "submitForm",
            "keypress .pledge_form_input":  "updateOnEnter",
        },
        updateOnEnter: function(e) {
            if (e.keyCode == 13) this.submitForm();
        },
        submitForm: function () {
            x = this.model.pledges.create({
                name: $(this.el).find('.pledge_name').val(),
                amount: $(this.el).find('.pledge_amount').val(),
                project: this.model.id,
            });
            $(this.el).children('.pledge_amount').val(Math.floor(100+Math.random()*(1000-100)));      
        },
        addOne: function(pledge) {
            view = new PledgeView({model: pledge, project: this.model}).render().el
            $(this.el).find('.pledge_list').append(view)
            this.updateTotal()
        },
        addAll: function() {
            project_id = this.model.id
            this.model.pledges.forProject(project_id).each(this.addOne)
        },
        addGraph: function() {
            view = new SingleGraphView(this)
            view.render()
            this.graph = view
        },
        updateGraph: function() {
            this.graph.update(this.graph)
        },
        render: function() {

            // Add to the projects tab
            tab = $(tim('single_project_list_item', this.model.toJSON()))
            $('#project_list').append(tab);
            

            b = $('#add-project').parent()
            $('#add-project').parent().remove()
            $('#project_list').append(b);

            $(this.el).html(tim('single_project', this.model.toJSON()));
            $('#ProjectView').append(this.el)
            this.updateTotal()
            this.addGraph()
            return this;
        },
        activateTab: function() {
            $('.project').hide()
            $('.project-tab').parent().removeClass('active')
            $('.project-tab-'+this.model.id).parent().addClass('active')
            $(this.el).show()
        },
        updateTotal: function() {
            total = $(this.el).find('.total').html(this.model.pledges.total(this.model.id))
            return parseFloat(total.html())
        }

    });

    window.AllProjectsView = Backbone.View.extend({
        tagName: "section",
        id: "ProjectView",
        el: $("#ProjectView"),
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll');
            Projects.bind('add', this.addOne);
            Projects.bind('reset', this.addAll);
            
            Projects.fetch();
        },
        events: {
            "click #add-project":  "newProject",
        },
        newProject: function() {
            // project_id = prompt('Project ID')
            name = prompt('Project Name')
            m = Projects.create({
                // project_id: project_id,
                name: name
            });
            PR.navigate('project/'+m.id)
            PR.showProject(m.id)
        },
        addOne: function(project) {
            var view = new SingleProjectView({model: project})//.render().el;
        },
        addAll: function() {
            Projects.each(this.addOne)
        },
        
    });
    AllProject = new AllProjectsView

        
    var ProjectRouter = Backbone.Router.extend({
      routes: {
        "project/:project": "showProject",
      },
      showProject: function(project) {
       project = Projects.get(project)
       project.view.activateTab()
      },
    });
    var PR = new ProjectRouter;
    Backbone.history.start()

    

})(jQuery);

