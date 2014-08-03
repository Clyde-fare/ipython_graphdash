__author__ = 'clyde'
import zipfile


def simple_archive(list_nbs, name):
    """Combines notebooks in list_nbs into a single zip file specified by name"""
    zipf = zipfile.ZipFile(name + '.zip', 'w')

    for nb in list_nbs:
        zipf.write(nb)
    zipf.close()


def archive_gen(raw_list_nbs, name='archive'):
    """Archives a collection of notebooks into a master file specified by name"""

    list_nbs = [nb.replace('tree/', '') for nb in raw_list_nbs]
    simple_archive(list_nbs, name)