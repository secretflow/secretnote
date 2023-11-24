import rich
from importlib_resources import as_file

from secretnote.utils.path import path_to_tree

if __name__ == "__main__":
    from secretnote._resources import require

    require.export()

    rich.print("Exported assets:")
    with as_file(require.dist_dir) as path:
        rich.print(path_to_tree(path))
