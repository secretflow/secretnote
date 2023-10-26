from typing import Any, Dict, Generator, List, Optional, Tuple

from pydantic import BaseModel


def update_forward_refs(global_ns: Dict[str, Any]):
    for v in global_ns.values():
        try:
            is_model = issubclass(v, BaseModel)
        except TypeError:
            continue
        if is_model:
            v.update_forward_refs()


def walk_models(
    root: Any,
    prefix: Tuple = (),
    stack: Optional[List[BaseModel]] = None,
) -> Generator[Tuple[Tuple, Any, List[BaseModel]], None, None]:
    if stack is None:
        stack = []
    if isinstance(root, list):
        for index, item in enumerate(root):
            keypath = prefix + (index,)
            yield from walk_models(item, keypath, stack)
    elif isinstance(root, dict):
        for key, value in root.items():
            keypath = prefix + (key,)
            yield from walk_models(value, keypath, stack)
    elif isinstance(root, BaseModel):
        for field_name, field_value in root:
            keypath = prefix + (field_name,)
            yield from walk_models(field_value, keypath, [*stack, root])
    else:
        yield prefix, root, stack
