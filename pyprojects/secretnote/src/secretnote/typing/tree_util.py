from typing import Any, Iterable, Type, TypeVar

import jax
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


def supports_pytree(model_t: Type[T]):
    keys = tuple(model_t.__fields__.keys())

    def flatten(container: T):
        return [
            (jax.tree_util.GetAttrKey(name), getattr(container, name)) for name in keys
        ], None

    def unflatten(aux_data: Any, content: Iterable):
        return model_t(**{name: value for name, value in zip(keys, content)})

    jax.tree_util.register_pytree_with_keys(model_t, flatten, unflatten)

    return model_t
