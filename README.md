ipython_graphdash
=================

Alternative graph based dashboard for IPython Notebooks

Nodes represent notebooks and links between them refer to links in markdown cells pointing at other notebooks.

To use copy/append the contents of ipython_graphdash/custom to your IPython profile (default is usually ~/.ipython/profile_default/static/custom).

Launch an IPython Notebook from within ipython/graphdash/example_tree and click the graphview icon (next to the New Notebook and Refresh icons) to get an idea of what's going on.

Currently to use in another folder we need to execute graph_gen.py in that folder first to generate the tree.json that contains the list of nodes/links.

Note: Requires IPython 2.x
