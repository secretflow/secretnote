from typing import Dict

from rich.console import Console
from rich.tree import Tree

CONSOLE = Console()


def rformat(obj):
    with CONSOLE.capture() as capture:
        CONSOLE.print(obj, end="")
    return capture.get()


def dict_to_tree(name: str, obj: Dict) -> Tree:
    root = Tree(name)
    for k, v in obj.items():
        if isinstance(v, dict):
            root.add(dict_to_tree(k, v))
        else:
            root.add(f"{k} = {rformat(v)}")
    return root
