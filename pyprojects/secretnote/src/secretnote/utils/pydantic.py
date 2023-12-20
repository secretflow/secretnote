from typing import (
    Any,
    Dict,
    Literal,
    Tuple,
    Type,
    Union,
    get_args,
    get_origin,
)

import orjson
from pydantic import BaseModel


def update_forward_refs(global_ns: Dict):
    models: Dict[str, Type[BaseModel]] = {}

    def collect_models(**items: Any):
        for k, v in items.items():
            try:
                is_model = issubclass(v, BaseModel)
            except TypeError:
                continue
            if is_model:
                models[k] = v
            try:
                collect_models(**vars(v))
            except TypeError:
                continue

    collect_models(**global_ns)

    for v in models.values():
        v.update_forward_refs()


def iter_union(annotation) -> Tuple:
    origin = annotation
    while True:
        args = get_args(origin)
        origin = get_origin(origin)
        if origin is Union:
            return tuple(t for subtype in args for t in iter_union(subtype))
        if origin is None:
            return args or (annotation,)


def extract_literals(annotation):
    items = set()
    for subtype in iter_union(annotation):
        if get_origin(subtype) is Literal:
            for arg in get_args(subtype):
                items.add(arg)
        else:
            raise TypeError(
                f"Expected {annotation} to be entirely composed"
                f" of literal types, got {subtype}"
            )
    return frozenset(items)


def orjson_dumps(v, *, default):
    return orjson.dumps(v, default=default, option=orjson.OPT_NON_STR_KEYS).decode()


class ORJSONConfig:
    json_loads = orjson.loads
    json_dumps = orjson_dumps
