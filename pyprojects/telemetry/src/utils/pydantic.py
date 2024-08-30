from typing import (
    Any,
    Dict,
    Iterable,
    List,
    Mapping,
    Tuple,
    Type,
    TypeVar,
    Union,
    cast,
    get_args,
    get_origin,
    overload,
)

import jax
import orjson
from pydantic import BaseModel, PrivateAttr
from typing_extensions import TypeGuard

T = TypeVar("T")

TypedKey = Tuple[Type[T], Any]


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


def orjson_dumps(v, *, default):
    return orjson.dumps(v, default=default, option=orjson.OPT_NON_STR_KEYS).decode()


def is_of_type(obj: Any, annotation: Type[T]) -> TypeGuard[T]:
    def extract_types(annotation) -> Tuple:
        origin = annotation
        while True:
            args = get_args(origin)
            origin = get_origin(origin)
            if origin is Union:
                return tuple(t for subtype in args for t in extract_types(subtype))
            if origin is None:
                return args or (annotation,)

    types = extract_types(annotation)

    if any(t is Any for t in types):
        return True

    return isinstance(obj, types)


def to_container(ref: "ProxiedModel", *, container_t=(list, dict, tuple)):
    def reconstruct(root: ProxiedModel):
        try:
            container = root.to_container()
        except (AttributeError, NotImplementedError):
            return root
        if isinstance(container, dict) and dict in container_t:
            return {k: reconstruct(v) for k, v in container.items()}
        if isinstance(container, list) and list in container_t:
            return [reconstruct(v) for v in container]
        if isinstance(container, tuple) and tuple in container_t:
            return tuple(reconstruct(v) for v in container)
        return container

    return reconstruct(ref)


def like_pytree(
    ref: "ProxiedModel",
    of_type: Type[T],
    *,
    container_t=(list, dict, tuple),
) -> Iterable[Tuple[str, T]]:
    container = to_container(ref, container_t=container_t)
    flattened, tree = jax.tree_util.tree_flatten_with_path(container)
    for path, value in flattened:
        if is_of_type(value, of_type):
            yield (jax.tree_util.keystr(path), value)


class ORJSONConfig:
    json_loads = orjson.loads
    json_dumps = orjson_dumps


class ProxiedModel(BaseModel):
    _lookup: Mapping[str, "ProxiedModel"] = PrivateAttr(default_factory=dict)

    def to_container(self) -> Union[List[T], Dict[Any, T], Tuple[T, ...]]:
        raise NotImplementedError

    def __getattribute__(self, __name):
        item = super().__getattribute__(__name)
        if isinstance(item, ProxiedModel):
            item._lookup = self._lookup
        return item


class Reference(BaseModel):
    ref: str

    def bind(self, types: Type[T], lookup: Mapping[str, "ProxiedModel"]) -> T:
        item = lookup[self.ref]

        if not is_of_type(item, types):
            raise TypeError(f"Expected {types}, got {type(item)}: {item}")

        if isinstance(item, ProxiedModel):
            item._lookup = lookup

        return cast(types, item)


class ReferenceMap(ProxiedModel, Mapping):
    __root__: Union[List[Reference], Dict[Any, Reference], Tuple[Reference, ...]]

    @overload
    def __getitem__(self, item: TypedKey[T]) -> T: ...

    @overload
    def __getitem__(self, item: Any): ...

    def __getitem__(self, item):
        if not isinstance(item, tuple):
            return self[Any, item]
        types, key = item
        try:
            ref = self.__root__[key]
            value = self._lookup[ref.ref]
            value._lookup = self._lookup
            if is_of_type(value, types):
                return value
            raise TypeError(f"Expected {types}, got {type(value)}: {value}")
        except (LookupError, TypeError) as e:
            raise KeyError(item) from e

    def __iter__(self):
        if isinstance(self.__root__, dict):
            yield from self.__root__
        else:
            yield from range(len(self.__root__))

    def of_type(self, types: Type[T]) -> Iterable[Tuple[Any, T]]:
        for key, value in self.items():
            if is_of_type(value, types):
                yield key, cast(T, value)

    def __len__(self):
        return len(self.__root__)

    @classmethod
    def empty_list(cls):
        return ReferenceMap(__root__=[])

    @classmethod
    def empty_dict(cls):
        return ReferenceMap(__root__={})

    @classmethod
    def from_container(cls, collection: Union[List, Dict]):
        return ReferenceMap(__root__=collection)


update_forward_refs(globals())
