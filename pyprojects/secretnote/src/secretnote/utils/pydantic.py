from typing import Any, Dict

import orjson
from pydantic import BaseModel


def update_forward_refs(global_ns: Dict[str, Any]):
    for v in global_ns.values():
        try:
            is_model = issubclass(v, BaseModel)
        except TypeError:
            continue
        if is_model:
            v.update_forward_refs()


def orjson_dumps(v, *, default):
    option = orjson.OPT_NON_STR_KEYS
    return orjson.dumps(v, default=default, option=option).decode()


class ORJSONConfig:
    json_loads = orjson.loads
    json_dumps = orjson_dumps
