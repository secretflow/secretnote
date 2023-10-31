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
)

import orjson
from more_itertools import flatten
from pydantic import BaseModel, PrivateAttr

T = TypeVar("T", bound="LookupProxy")

TypedKey = Tuple[Type[T], Any]


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


def extract_types(annotation):
    args = get_args(annotation)
    if not args:
        return (annotation,)
    return tuple(flatten(map(extract_types, args)))


class ORJSONConfig:
    json_loads = orjson.loads
    json_dumps = orjson_dumps


class LookupProxy(BaseModel):
    _lookup: Mapping[str, "LookupProxy"] = PrivateAttr(default_factory=dict)

    def __getattribute__(self, __name):
        item = super().__getattribute__(__name)
        if isinstance(item, LookupProxy):
            item._lookup = self._lookup
        return item


class Reference(BaseModel):
    ref: str

    def bind(self, type_: Type[T], lookup: Mapping[str, "LookupProxy"]) -> T:
        item = lookup[self.ref]

        types = extract_types(type_)

        if not isinstance(item, types):
            raise TypeError(f"Expected {type_}, got {type(item)}")

        item._lookup = lookup
        return cast(type_, item)


class ReferenceMap(LookupProxy, Mapping):
    __root__: Union[List[Reference], Dict[Any, Reference], Tuple[Reference, ...]]

    def of_type(self, type_: Type[T]) -> Iterable[Tuple[Any, T]]:
        for key, value in self:
            if isinstance(value, type_):
                yield key, value

    def __getitem__(self, item: TypedKey[T]) -> T:
        type_, key = item
        try:
            ref = self.__root__[key]
            value = self._lookup[ref.ref]
            if type_ == Any:
                return cast(Any, value)
            if not isinstance(value, type_):
                raise TypeError(f"Expected {type_}, got {type(value)}")
        except (LookupError, TypeError) as e:
            raise KeyError(item) from e
        return value

    def __iter__(self):
        def generator():
            if isinstance(self.__root__, dict):
                for key in self.__root__:
                    yield key, self[Any, key]
            else:
                for idx in range(len(self.__root__)):
                    yield idx, self[Any, idx]

        return generator()

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
