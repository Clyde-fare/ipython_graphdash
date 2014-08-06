var IPython = (function (IPython) {

    var tree_gen = function(callback){
        $("#refresh_notebook_list").attr("disabled", true).addClass('ui-state-disabled');

        callback = callback ||  $.noop
        $.ajaxSetup({async:false})

        $.get('/static/custom/map_view/tree_gen.py', function(python_code) {
            python_code += '\ngen_graph(project_dir=os.getcwd())'

            var kernel_response = $.post('/api/kernels')
            var dash_kernel_id = $.parseJSON(kernel_response.responseText).id
            var dash_kernel = new IPython.Kernel('/api/kernels')
            var ws_url = 'ws' + document.location.origin.substring(4)
            dash_kernel._kernel_started({kernel_id: dash_kernel_id, ws_url: ws_url})

            var close_kernel = function(){
                $.ajax({ type: 'DELETE', url: '/api/kernels/' + dash_kernel_id}).then(function(){callback(); $("#refresh_notebook_list").attr("disabled", false).removeClass('ui-state-disabled');})
            }           
     
            var run_code = function(){
                dash_kernel.execute(python_code, {'execute_reply': close_kernel})
            }
            
            //async issues
            setTimeout(run_code,150)
        
            $.ajaxSetup({async:true})
            });
       }

    IPython.tree_gen = tree_gen
    return IPython
}(IPython))
