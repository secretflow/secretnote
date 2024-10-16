from collections import deque
from os import makedirs, path
from pathlib import Path
from typing import Deque, Iterable, Tuple

from rich.tree import Tree


def find_all_files(path: Path) -> Iterable[Path]:
    for item in path.iterdir():
        if item.is_dir():
            yield from find_all_files(item)
        elif item.is_file() or item.is_symlink():
            yield item


def path_to_tree(root: Path) -> Tree:
    tree = Tree(root.name)
    queue: Deque[Tuple[Tree, Path]] = deque([(tree, root)])
    while queue:
        parent, path = queue.popleft()
        if path.is_file():
            continue
        for item in path.iterdir():
            subtree = parent.add(item.name)
            queue.append((subtree, item))
    return tree


def get_db_path():
    from jupyter_core import paths

    jupyter_config_dir = paths.jupyter_config_dir()
    if not path.exists(jupyter_config_dir):
        makedirs(jupyter_config_dir)
    return f"sqlite:///{jupyter_config_dir}/secretnote.db"
