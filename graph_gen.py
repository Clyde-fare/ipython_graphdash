import re, os , fnmatch, json
from collections import OrderedDict
from IPython.html.services.notebooks.filenbmanager import FileNotebookManager
from tornado.web import HTTPError

flatten = lambda l:(e for sl in l for e in sl)

def extract_nb_links(markdown_cells):
    """Takes a list of markdown cells and extracts any links to other notebooks present
    
    Parameters
    ----------
    markdown_cells : list
        The list of markdown cells we are searching for links.

    Returns
    -------
    nb_links  :  list
        The list of links to other notebooks in the markdown cells passed to the function"""
    
    nb_link_extractor = re.compile("(?<=\]\()\S+ipynb")  
    nb_link_finds = [nb_link_extractor.findall(cell['source']) for cell in markdown_cells]
    nb_links = flatten([f for f in nb_link_finds if f])    
    return nb_links

def get_markdown_cells(nb_file_path):
    """Takes a notebook file path and extracts the markdown cells present
    
    Parameters
    ----------
    nb_file_path : string
        The full path to the notebook whose cells we are extracting.

    Returns
    -------
    markdown_cells  :  list
        The list of markdown cells present in the notebook"""
    
    nb_manager = FileNotebookManager()
    rel_nb_file_path = os.path.relpath(nb_file_path)
    nb_path, nb_name = os.path.split(rel_nb_file_path)
    
    #if linked notebook does not exist we ignore it
    try:
        notebook = nb_manager.get_notebook(nb_name, nb_path)
    except HTTPError as e:
        return []
    
    try:
        markdown_cells = [cell for cell in notebook['content']['worksheets'][0]['cells'] 
                               if cell['cell_type'] == 'markdown']   
    except IndexError:
        markdown_cells = []
        
    return markdown_cells

def get_linked_nbs(nb_file_path, project_graph=None):
    """Recursively extracts all notebooks linked to one another starting with those linked to the notebook
    specified by nb_file_path.
    
    Returns a dictionary with keys corresponding to each individual notebook and values corresponding 
    to all other notebooks linked to the key
    
    Parameters
    ----------
    nb_file_path : string
        The full path to the notebook whose notebook links we are extracting.

    project_graph : dict
        The graph before we have extracted the current notebook's links
        
    Returns
    -------
    project_graph : dict
        The graph after we have extracted the current notebook's links
    """
    
    if not project_graph:
        project_graph = OrderedDict()
     
    markdown_cells = get_markdown_cells(nb_file_path)
    rel_nb_links = extract_nb_links(markdown_cells)
    
    #local notebook links are relative to the directory they are in
    active_dir = os.path.dirname(nb_file_path)    
    nb_links = sorted([os.path.join(active_dir, rel_nb_link) for rel_nb_link in rel_nb_links if not 'http' in rel_nb_link])
    project_graph.update({nb_file_path:nb_links})
    
    for nb_file_path in nb_links:
        if nb_file_path not in project_graph:
            get_linked_nbs(nb_file_path, project_graph)
        
    return project_graph

def get_project_graph(path=''):
    """Extracts a dictionary of notebook file paths keys and lists of linked notebook file paths values
    starting with all notebooks in the current directory and recursively searching all sub directories"""
    
    nb_paths = []
    for root, dirnames, filenames in os.walk(path):
        for filename in fnmatch.filter(filenames, '*.ipynb'):
            #using unicode and realpath because full_nb_paths() generates unicode fullpaths
            if '.ipynb_checkpoints' not in root:
                nb_paths.append(unicode(os.path.realpath(os.path.join(root, filename))))
   
    project_graph = OrderedDict()
    for nb_file_path in nb_paths:
        project_graph = get_linked_nbs(nb_file_path, project_graph)
        
    #using an OrderedDict to help debugging 
    return OrderedDict(sorted(project_graph.items()))

def get_nb_group(nb_name, nb_path):
    """Hacked together trial function to assign colours to notebooks"""

    if 'dead' in nb_name:
        return 1
    elif 'analysis' in nb_name:
        return 0
    elif 'final' in nb_name:
        return 4
    else:
        return 3

def get_json(project_graph):
    """Constructs a json representation of the project_graph"""
    nodes, links = [], []
    
    for nb_path in project_graph:
        nb_name = os.path.basename(nb_path).replace('.ipynb','')
        rel_nb_path = 'tree/' + os.path.relpath(nb_path)
            
        linked_nb_paths = project_graph[nb_path]
        
        node = {'name': nb_name, 'url':rel_nb_path, 'group':get_nb_group(nb_name, rel_nb_path)}
        
        #need to check because we might have found this node already as a link
        if node not in nodes:
            nodes.append(node)
        
        for linked_nb_path in linked_nb_paths:
            linked_nb_name = os.path.basename(linked_nb_path).replace('.ipynb','')
            linked_rel_nb_path = 'tree/' + os.path.relpath(linked_nb_path)
                
            try:
                link_node = next(n for n in nodes if n.get('name') == linked_nb_name and n.get('url') == linked_rel_nb_path)
            except StopIteration:
                link_node = {'name':linked_nb_name, 'url':linked_rel_nb_path, 'group':get_nb_group(linked_nb_name, linked_rel_nb_path)}
                nodes.append(link_node)
            
            edge = {'source':nodes.index(node), 'target':nodes.index(link_node), 'value':1}
            links.append(edge)
            
    return json.dumps({'nodes':nodes, 'links':links}, sort_keys=True,indent=4, separators=(',', ': '))

def gen_graph(project_dir, f_nm = 'tree.json'):
    project_graph = get_project_graph(project_dir)

    with open(f_nm, 'w') as json_f:
        json_f.write(get_json(project_graph))

if __name__ == '__main__':
    gen_graph(project_dir=os.getcwd())
