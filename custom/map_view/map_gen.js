var IPython = (function(IPython){
      var map_gen = function(){
          var width = 960,
              height = 700,
              fill = d3.scale.category10();
             // nodes = d3.range(100).map(Object);
      
          var color = d3.scale.category20();
          
          var force = d3.layout.force()
              .charge(-120)
              .linkDistance(30)
              .size([width, height]);
          
          var svg = d3.select('#notebook_graph').append("svg")
              .attr("width", width)
              .attr("height", height)
    
          //v=random number so tree.json isn't cached by the browser      
          var tree_fn = "/files/tree.json?v=" + Math.floor(Math.random() * 100) 

          d3.json(tree_fn, function(error, graph) {
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();
          
            var link = svg.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return Math.sqrt(d.value); });
          
            var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("a")
                .attr("class", "node")
                //.attr("xlink:href", function(d) {return d.url; })
                //.attr("target", "_blank")
                .on("click", click_handler)
                .call(force.drag)
            node.append("circle")
                .attr("r", 5)
                .style("fill", function(d) { return color(d.group); })

            node.append("title")
                .text(function(d) { return d.name; });
          
            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });
          
              node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            });

            function click_handler(d){
                if (event.shiftKey==1) {
                    //deselect/select notebook
                    if (d.selected) {
                        d3.select(this).select("circle").transition()
                            .duration(250)
                            .attr("r", 5)
                            .style("stroke", "#fff")
                            .style("stroke-width", "1.5px");
                        d.selected = false

                        IPython.selected_notebooks = $.grep(IPython.selected_notebooks, function(value) {
                            return value != d.url;
                        });

                        if (IPython.selected_notebooks.length === 0){
                           //hide archive button
                            $('#notebook_toolbar').children('div.span8').children().hide()
                        }
                    }
                    else {
                        d3.select(this).select("circle").transition()
                            .duration(250)
                            .attr("r", 6)
                            .style("stroke", "#ff0000")
                            .style("stroke-width", "3px");
                        d.selected = true
                        IPython.selected_notebooks.push(d.url)

                        //show archive button
                        $('#notebook_toolbar').children('div.span8').children().show()
                    }
                }
                else {
                    //open notebook
                    var win = window.open(d.url, '_blank');
                    win.focus();
                }
            }
          });

          return svg
    };
    IPython.selected_notebooks = []
    IPython.map_gen = map_gen
    return IPython
}(IPython))
