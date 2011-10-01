(function ($) {
    Project = Backbone.Model.extend({
        //Create a model to hold friend atribute
        name: null,
        target_amount: null
    });
    
    ProjectList = Backbone.Collection.extend({
        model: Project,
        localStorage: new Store("project_store"),
    });

    window.Projects = new ProjectList;

    window.SingleProjectView = Backbone.View.extend({
        tagName: "li",
        className: "project",
        initialize: function() {
              _.bindAll(this, 'render');
              this.model.bind('change', this.render);
              this.model.view = this;
              
            },
        render: function() {
            $(this.el).html(tim('single_project', this.model.toJSON()));
            $('#project_list').append(this.el);
            return this;
        }
    });

    window.ProjectView = Backbone.View.extend({
        tagName: "div",
        id: "project_list",
        el: $("#projects"),
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
            name = prompt('Project Name')
            Projects.create({
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
    AllProject = new ProjectView

})(jQuery);

