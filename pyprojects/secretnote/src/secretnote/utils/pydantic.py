from typing import Any, Dict

from pydantic import BaseModel


def update_forward_refs(global_ns: Dict[str, Any]):
    for v in global_ns.values():
        try:
            is_model = issubclass(v, BaseModel)
        except TypeError:
            continue
        if is_model:
            v.update_forward_refs()
