(function ($) {
    Project = Backbone.Model.extend({
        project_id: null,
        name: null,
        target_amount: null
    });
    
    ProjectList = Backbone.Collection.extend({
        model: Project,
        localStorage: new Store("project_store"),
        
    });

    window.Projects = new ProjectList;

    window.SingleProjectView = Backbone.View.extend({
        tagName: "section",
        className: "project",
        initialize: function() {
            _.bindAll(this, 'render', 'addOne', 'addAll');
            this.model.bind('change', this.render);
            this.model.view = this;
            this.model.pledges = new PledgeList(this)
            
            // this.model.pledges.bind('reset', this.addAll);
            this.model.pledges.bind('add', this.addOne);
            },
        addOne: function(pledge) {
            // console.debug($(this.el))
            view = new PledgeView({model: pledge, project: this.model}).render().el
            console.debug($(this.el).children('.project_pledges').children())
            $(this.el).find('div.pledge_list').append(view)
            $(this.el).find('h2').html('asdasd')
        },
        addAll: function() {
            console.debug(this)
            this.model.pledges.each(this.addOne)
        },
        render: function() {

            // Add to the projects tab
            $('#project_list').append(tim('single_project_list_item', this.model.toJSON()));

            $(this.el).html(tim('single_project', this.model.toJSON()));
            $('#ProjectView').append(this.el)
            this.pledge_view = new PledgesForProjectView(this)
            this.pledge_view.render()
            return this;
        },
        ActivateTab: function() {
            console.debug('ActivateTab')
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
        },
        addOne: function(project) {
            var view = new SingleProjectView({model: project}).render().el;
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
       // console.debug(Projects)
       project = Projects.at(project)
       // console.debug(project)
       project.view.ActivateTab()
      },
    });
    var PR = new ProjectRouter;
    Backbone.history.start()

    

})(jQuery);

