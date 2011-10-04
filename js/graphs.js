(function ($) {

    window.SingleGraphView = Backbone.View.extend({
        tagName: "div",
        className: "graph",
        initialize: function(model) {
            _.bindAll(this, 'render', 'raphael', 'graph');
            this.project = model
            this.raphael = Raphael($(this.el).find('.graph')[0])
            this.project.bind('change', this.update, this)
            this.graph_properties = {
                attrs : {
                    opacity: 0
                }
            }
        },
        makeGraph: function(r) {
            /* 
                Given an Paper element (r, a Raphael object tied to an element),
                make a graph based on the project this view relates to. 
            */
            target = this.model.get('target_amount')
            total = this.project.model.view.updateTotal()
            max = target*2
            var initialData = [[parseFloat(total)],[target], [max]];
            graph = r.g.barchart(50, 10, 300, 420, [initialData], 0, {stacked:false, type: "round"});
            graph.bars[0][2].attr([this.graph_properties.attrs])
            return graph
        },
        animate: function(old_graph_view, new_graph) {
            /* 
                Given two graphs, animate between them.
                
                This is slightly more tricky than you might expec.
                
                When a bar is too small to show on the graph, a path attribute
                isn't created for that bar at all.
                
                This means that it's imposable to animate from nothing to the
                new bar size (that might also be nothing).
                
                The if statements below handle this, and remake the graph to
                animate from if need be.
                
                Many Bothans died to bring us this information.
            */
            old_graph = old_graph_view.graph
            $.each(old_graph.bars[0], function(k, v) {
                v.show()
                if (!new_graph.bars[0][k].attr("path")) {
                    v.hide()
                }
                if (!old_graph.bars[0][k].attr("path")) {
                    old_graph = old_graph_view.makeGraph(old_graph_view.raphael)
                }
                
                try {
                    v.animate({ path:  new_graph.bars[0][k].attr("path")}, 200);
                } catch(s) {
                    old_graph = old_graph_view.makeGraph(old_graph_view.raphael)
                }
            });

            old_graph.bars[0][2].attr([this.graph_properties.attrs])

            // Now remove the new chart
            new_graph.remove();

            return old_graph
        },
        update: function(graph) {
            /* 
                Make a new graph based on the new data in the project, and sent
                both new and old to animate.
            */
            new_graph = this.makeGraph(Raphael($('.hidden_graph')[0]))
            this.graph = this.animate(this, new_graph)
        },
        render: function() {
            // Draw the initial graph
            this.graph = this.makeGraph(this.raphael)
            return this;
        },
    });

})(jQuery);

