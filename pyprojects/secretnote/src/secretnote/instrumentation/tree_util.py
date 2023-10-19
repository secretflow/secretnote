from collections import defaultdict
from typing import Any, Dict, Hashable, List, Tuple, Union

from jax.tree_util import (
    DictKey,
    FlattenedIndexKey,
    GetAttrKey,
    SequenceKey,
    all_leaves,
    tree_flatten,
    tree_flatten_with_path,
    tree_map,
    tree_unflatten,
    treedef_tuple,
)
from pydantic import BaseModel

from .pprint import fingerprint, json_key, qualname, snapshot

PyTreeKey = Union[GetAttrKey, DictKey, SequenceKey, FlattenedIndexKey]
PyTreeKeyPath = Tuple[PyTreeKey, ...]

NormalizedPyTreeKeyPath = Tuple[Hashable, ...]


class PyTreeLeafSnapshot(BaseModel):
    id: str
    type: str
    snapshot: str

    @classmethod
    def from_pytree(cls, node: Any):
        return cls(
            id=fingerprint(node),
            type=qualname(type(node)),
            snapshot=snapshot(node),
        )


class PyTreeSnapshot(BaseModel):
    leaves: List[PyTreeLeafSnapshot] = []
    keypaths: List[NormalizedPyTreeKeyPath] = []
    keyrefs: Dict[str, PyTreeLeafSnapshot] = {}


def recursive_defaultdict():
    return defaultdict(recursive_defaultdict)


def non_standard_container(pytree: Any) -> bool:
    return not isinstance(pytree, (list, dict, tuple))


def normalized_pytree(pytree: Any) -> Any:
    def convert_node(node: Any) -> Any:
        if all_leaves([node]):
            return node

        leaves, treedef = tree_flatten(node)
        as_tuple = treedef_tuple(treedef.children())
        subtree = tree_unflatten(as_tuple, leaves)

        return normalized_pytree(subtree)

    return tree_map(convert_node, pytree, is_leaf=non_standard_container)


def get_key(key: PyTreeKey) -> Tuple[Any, Hashable]:
    if isinstance(key, GetAttrKey):
        idx = key.name
    elif isinstance(key, DictKey):
        idx = key.key
    elif isinstance(key, SequenceKey):
        idx = key.idx
    elif isinstance(key, FlattenedIndexKey):
        idx = key.key
    else:
        raise ValueError(f"Unknown key type: {key}")
    return idx, json_key(idx)


def collect_keypaths(*keypaths: PyTreeKeyPath):
    paths: List[NormalizedPyTreeKeyPath] = []
    refs: Dict[str, PyTreeLeafSnapshot] = {}

    for path in keypaths:
        segments: List[Hashable] = []

        for key in path:
            original_key, key = get_key(key)
            segments.append(key)
            if original_key != key:
                key_snapshot = PyTreeLeafSnapshot.from_pytree(key)
                refs[fingerprint(original_key)] = key_snapshot

        paths.append(tuple(segments))

    return paths, refs


def pytree_snapshot(pytree: Any) -> PyTreeSnapshot:
    pytree = normalized_pytree(pytree)
    leaves, treedef = tree_flatten_with_path(pytree)

    result = PyTreeSnapshot()

    for path, leaf in leaves:
        result.leaves.append(PyTreeLeafSnapshot.from_pytree(leaf))

        path_segments: List[Hashable] = []

        for key in path:
            original_key, key = get_key(key)
            path_segments.append(key)

            if original_key != key:
                key_snapshot = PyTreeLeafSnapshot.from_pytree(key)
                result.keyrefs[fingerprint(original_key)] = key_snapshot

        result.keypaths.append(tuple(path_segments))

    return result
