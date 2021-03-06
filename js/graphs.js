(function ($) {
    
    window.TotalGraphView = Backbone.View.extend({
        tagName: "div",
        className: "hidden_graph",
        makeGraph: function(total, target) {
            r = Raphael(this.el)
            var initialData = [[target], [parseFloat(total)]];
            graph = r.g.barchart(0, 20, 500, 300, [initialData], {stacked:false, type: "square"});
            graph.bars[0][1].attr([{fill: '#E72A87', stroke: '#E72A87'}])
            graph.bars[0][0].attr([{fill: '#A4C958', stroke: '#A4C958'}])
            
            b1 = graph.bars[0][1]
            b2 = graph.bars[0][0]
            
            r.g.txtattr.font = "30px ProximaNovaExtrabold, sans-serif";
            function getAmountPos(b) {
                return [b.getBBox().x+90, b.getBBox().y-10]
            }
            function getLabelPos(b) {
                x = b.getBBox().x
                y = b.getBBox().y
                if (x != 0){
                    return [x+90, y+30]
                }
            }
            
            total_label_pos = getLabelPos(b1)
            target_label_pos = getLabelPos(b2)
            
            total_amount_pos = getAmountPos(b1)
            target_amount_pos = getAmountPos(b2)
            if (total_label_pos) {
                total_text = "TOTAL"
            } else {
                total_text = ""
            }
            try {
                graph.bars[0][1].internal_label = r.g.text(total_label_pos[0], total_label_pos[1], total_text).attr({"fill": "#EE6AAB"});
            } catch(s) {
            
            }
            
            graph.bars[0][0].internal_label = r.g.text(target_label_pos[0], target_label_pos[1], "TARGET").attr({"fill": "#BFD98A"});
            
            graph.bars[0][1].amount_label = r.g.text(total_amount_pos[0], total_amount_pos[1], '£'+CommaFormatted(total)).attr({"fill": "#EE6AAB"});
            graph.bars[0][0].amount_label = r.g.text(target_amount_pos[0], target_amount_pos[1], '£'+CommaFormatted(target)).attr({"fill": "#BFD98A"});
            
            // Hide the total text when the graph is too small
            mask = r.rect(30, 301, 505, 50).attr({'fill' : '#FFF', stroke: '#FFF'});
            
            return this.el
        }
    })
    
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
            var initialData = [[target], [parseFloat(total)], [max]];
            graph = r.g.barchart(60, 40, 700, 420, [initialData], {stacked:false, type: "square"});
            graph.bars[0][2].attr([this.graph_properties.attrs])
            graph.bars[0][1].attr([{fill: '#E72A87', stroke: '#E72A87'}])
            graph.bars[0][0].attr([{fill: '#A4C958', stroke: '#A4C958'}])
            
            
            b1 = graph.bars[0][1]
            b2 = graph.bars[0][0]
            
            r.g.txtattr.font = "30px ProximaNovaExtrabold, sans-serif";
            function getAmountPos(b) {
                return [b.getBBox().x+90, b.getBBox().y-20]
            }
            function getLabelPos(b) {
                x = b.getBBox().x
                y = b.getBBox().y
                if (x != 0){
                    return [x+90, y+20]
                }
            }
            // #EE6AAB
            total_label_pos = getLabelPos(b1)
            target_label_pos = getLabelPos(b2)

            total_amount_pos = getAmountPos(b1)
            target_amount_pos = getAmountPos(b2)
            
            if (total_label_pos) {
                total_text = "TOTAL"
            } else {
                total_text = ""
            }
            try {
            graph.bars[0][1].internal_label = r.g.text(total_label_pos[0], total_label_pos[1], total_text).attr({"fill": "#EE6AAB"});
            } catch(s) {
            
            }
            
            graph.bars[0][0].internal_label = r.g.text(target_label_pos[0], target_label_pos[1], "TARGET").attr({"fill": "#BFD98A"});
            graph.bars[0][2].internal_label = r.g.text(0,0, "").attr({opacity: 0});
            
            graph.bars[0][1].amount_label = r.g.text(total_amount_pos[0], total_amount_pos[1], '£'+CommaFormatted(total)).attr({"fill": "#EE6AAB"});
            graph.bars[0][0].amount_label = r.g.text(target_amount_pos[0], target_amount_pos[1], '£'+CommaFormatted(target)).attr({"fill": "#BFD98A"});
            graph.bars[0][2].amount_label = r.g.text(0,0, "").attr({opacity: 0});
            
            // Hide the total text when the graph is too small
            mask = r.rect(98, 441, 405, 50).attr({'fill' : '#FFF', stroke: '#FFF'});
            
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
                    v.internal_label.hide()
                    v.amount_label.hide()
                }
                if (!old_graph.bars[0][k].attr("path")) {
                    old_graph = old_graph_view.makeGraph(old_graph_view.raphael)
                    v = old_graph.bars[0][k]
                }
                
                try {
                    
                    v.animate({ path:  new_graph.bars[0][k].attr("path")}, 200);
                    internal_y = new_graph.bars[0][k].internal_label.attr("y")
                    v.internal_label.animate({y:  internal_y}, 200);

                    updated_amount = new_graph.bars[0][k].amount_label.attr("text")
                    amount_y = new_graph.bars[0][k].amount_label.attr("y")
                    v.amount_label.attr({text: updated_amount});
                    v.amount_label.animate({y:  amount_y}, 200);

                } catch(s) {
                    old_graph.remove()
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

