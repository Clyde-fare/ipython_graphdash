var map_gen = function (){
      var width = 960,
          height = 700,
          fill = d3.scale.category10(),
          nodes = d3.range(100).map(Object);
      
      var color = d3.scale.category20();
      
      var force = d3.layout.force()
          .charge(-120)
          .linkDistance(30)
          .size([width, height]);
      
      var svg = d3.select('#notebook_graph').append("svg")
          .attr("width", width)
          .attr("height", height)
      
      d3.json("/files/tree.json", function(error, graph) {
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
            .attr("xlink:href", function(d) { return d.url; })
            .attr("target", "_blank")
            .call(force.drag);
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
      });
};
