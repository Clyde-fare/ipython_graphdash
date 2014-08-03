(function(){
    //save form for adding new notebooks
    var form = $('#notebook_toolbar')[0].children[0].children[0]

    var gen_graph = function(){
        if ($('#notebook_graph').length ==0) {
            //hide normal list of notebooks
	        $('#notebook_list').hide()
            //create notebook graph container
            $('#notebook_toolbar + #notebook_list').before($("<div/>").addClass('list_container').attr('id', 'notebook_graph'));
            //set icon
            $('#graph_view')[0].children[0].className = "icon-list"
            //remove form for adding new notebooks
            $('#notebook_toolbar')[0].children[0].children[0].remove()
            //set archive button and initialize it to invisible
            $('#notebook_toolbar').children('div.span8').prepend(archive_button)
            $('#notebook_toolbar').children('div.span8').children().hide()

            //if tree.json doesn't exist generate it first, then call map_gen to populate the notebook graph container
            $.get('/files/tree.json?v=' + Math.floor(Math.random() * 100))
             .done(IPython.map_gen)
             .fail(function() {IPython.tree_gen(IPython.map_gen)})
        }

        else {
	        $('#notebook_list').show()
            $('#notebook_graph').remove();
            $('#graph_toolbar').remove();
            //remove archive button
            $('#notebook_toolbar')[0].children[0].children[0].remove()
            //re-add form for adding new notebooks
            $('#notebook_toolbar').children('div.span8').prepend(form)
            $('#graph_view')[0].children[0].className = "icon-code-fork"
        }
    }

    var graph_button = $('<button/>')
        .addClass('btn')
        .attr("title", "Generates a graphical view of the notebooks")
        .append(
            $("<i/>").addClass("icon-code-fork")
        );

    graph_button.attr('id', 'graph_view');
    graph_button.click(gen_graph);
    $('#notebook_buttons').append(graph_button)

    var archive_button = $('<button/>')
        .addClass('btn')
        .attr("title", "Archives selected notebook pages")
        .append('Archive')

    archive_button.attr('id', 'archive');
    archive_button.click(function(){IPython.archive_gen('archive')});
    
    }());



