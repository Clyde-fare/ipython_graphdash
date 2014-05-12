(function(){
    var gen_graph = function(){
        if ($('#notebook_graph').length ==0) {
	    $('#notebook_list').hide()
            $('#notebook_toolbar + #notebook_list').before($("<div/>").addClass('list_container').attr('id', 'notebook_graph'));    
            map_gen()
        }
        else {
	    $('#notebook_list').show()
            $('#notebook_graph').remove();
        } 
	           
    }

    var graph_button = $('<button/>')
                .addClass('btn')
                .attr("title", "Switch to a graphical view of the notebooks")
                .append(
                    $("<i/>").addClass("icon-code-fork")
                );
    graph_button.attr('id', 'graph_view');
    graph_button.click(gen_graph);
    $('#notebook_buttons').append(graph_button)
    }());
