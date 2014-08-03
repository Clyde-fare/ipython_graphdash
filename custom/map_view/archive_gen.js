/**
 * Created by clyde on 03/08/14.
 */
var IPython = (function(IPython){
    var archive_gen = function(archive_name){
        $("#archive").attr("disabled", true).addClass('ui-state-disabled');
        var callback = function(){alert('Archived selected pages'); $("#archive").attr("disabled", false).removeClass('ui-state-disabled');}
        $.ajaxSetup({async:false})

        $.get('/static/custom/map_view/archive_gen.py', function(python_code) {
            var list_notebooks = []
            for (var i=0;i<IPython.selected_notebooks.length;i++){
                list_notebooks.push('"' + IPython.selected_notebooks[i] + '"')
            }
            python_code += '\nlist_notebooks =[' + list_notebooks.join() +  ']\narchive_gen(list_notebooks, "' + archive_name +  '")'

            var kernel_response = $.post('/api/kernels')
            var dash_kernel_id = $.parseJSON(kernel_response.responseText).id
            var dash_kernel = new IPython.Kernel('/api/kernels')
            var ws_url = 'ws' + document.location.origin.substring(4)
            dash_kernel._kernel_started({kernel_id: dash_kernel_id, ws_url: ws_url})

            var close_kernel = function(){
                $.ajax({ type: 'DELETE', url: '/api/kernels/' + dash_kernel_id}).then(callback())
            }

            var run_code = function(){
                dash_kernel.execute(python_code, {'execute_reply': close_kernel})
            }

            //async issues
            setTimeout(run_code,150)

            $.ajaxSetup({async:true})
            });
       }

    IPython.archive_gen = archive_gen
    return IPython
}(IPython))