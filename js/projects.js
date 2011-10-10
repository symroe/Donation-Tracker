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
            _.bindAll(this, 'render', 'addOne', 'addAll', 'graph', 'total');

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
            $(this.el).find('.pledge_name').val('')
            $(this.el).find('.pledge_amount').val('')
            $('body #pledge_name')[0].focus()
        },
        addOne: function(pledge) {
            view = new PledgeView({model: pledge, project: this.model}).render().el
            new_el = $(this.el).find('.pledge_list').append(view)
            $(view).hide().prependTo($(this.el).find('.pledge_list')).slideDown('fast')
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
            

            b = $('#all-projects').parent()
            $('#all-projects').parent().remove()
            $('#project_list').append(b);

            $(this.el).html(tim('single_project', this.model.toJSON()));
            $('#ProjectView').append(this.el)
            this.updateTotal()
            $('body #pledge_name')[0].focus()
            this.addGraph()
            return this;
        },
        activateTab: function() {
            $('.project').hide()
            $('.overviewTab').hide()
            $('.project-tab').parent().removeClass('active')
            $('#all-projects').parent().removeClass('active')
            $('.project-tab-'+this.model.id).parent().addClass('active')
            $(this.el).show()
        },
        updateTotal: function() {
            total = $(this.el).find('.total').html(this.model.pledges.total(this.model.id))
            this.total = total
            return parseFloat(total.html())
        }
    });

    window.projectOverview = Backbone.View.extend({
        tagName: 'section',
        className: 'overviewTab',
        initialize: function() {
            this.graph = new TotalGraphView
        },
        activateTab: function() {
            $('.project').hide()
            $('.overviewTab').hide()
            $('.project-tab').parent().removeClass('active')
            $('#all-projects').parent().addClass('active')
            PR.navigate('overview')
            this.render().show()
        },
        render: function() {
            tab = this.el
            total = 0
            target = 0
            Projects.each(function(p) {
                 total += parseFloat(p.get('total'))
                 target += parseFloat(p.get('target_amount'))
            })
            
            $('body').find('.overviewgraph').find('svg').remove()
            g = this.graph.makeGraph(total, target)
            $(this.el).html(tim('overview', {}))
            $(this.el).find('.overviewgraph').append(g)
            $(this.el).find('.overviewgraph').find('div').removeClass('hidden_graph')
            
            $('#ProjectView').append(this.el)
            return $(this.el)
        }
    })
    overviewTab = new projectOverview;

    window.AllProjectsView = Backbone.View.extend({
        tagName: "section",
        id: "ProjectView",
        el: $("#ProjectView"),
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll', 'overview');
            Projects.bind('add', this.addOne);
            Projects.bind('reset', this.addAll);
            this.overview = overviewTab
            
            Projects.fetch();
        },
        events: {
            "click #add-project":  "newProject",
            "click #all-projects":  "overview",
        },
        editLastPledge: function(e) {
            console.debug(e)
        },
        overview: function() {
            // console.debug(overviewTab)
            overviewTab.activateTab()
            // console.debug('worked')
        },
        newProject: function() {
            name = prompt('Project Name')
            if (name != "null") {
                m = Projects.create({
                    name: name
                });
                PR.navigate('project/'+m.id)
                PR.showProject(m.id)                
            }
        },
        addOne: function(project) {
            var view = new SingleProjectView({model: project})//.render().el;
        },
        addAll: function() {
            Projects.each(this.addOne)
            // var all = overviewTab
        },
        
    });
    AllProject = new AllProjectsView

        
    var ProjectRouter = Backbone.Router.extend({
        routes: {
            "" : "firstProject",
            "overview" : "overview",
            "add": "addProject",
            "project/:project": "showProject",
        },
        firstProject: function() {
            this.navigate('project/'+Projects.at(0).id)
            this.showProject(Projects.at(0))
        },
        showProject: function(project) {
            project = Projects.get(project)
            project.view.activateTab()
        },
        overview: function() {
            overviewTab.activateTab()
        },
        addProject: function() {
            AllProject.newProject()
        },
    });
    var PR = new ProjectRouter;
    // PR.navigate(Projects.at(0))
    Backbone.history.start()

    

})(jQuery);

