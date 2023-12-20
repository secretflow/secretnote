from __future__ import annotations

import inspect
from collections import defaultdict
from contextlib import suppress
from typing import (
    Any,
    ClassVar,
    Dict,
    FrozenSet,
    List,
    Set,
    Tuple,
    Type,
    TypeVar,
    Union,
    cast,
)

from pydantic import PrivateAttr
from pydantic.generics import GenericModel
from pydantic.schema import schema as create_schema
from pydantic.typing import display_as_type

from secretnote.utils.pydantic import extract_literals

from .schema import SchemaExtension

_MarkerDict = Dict[str, Dict[str, Union["_MarkerDict", str, FrozenSet[str]]]]


class Marker:
    trait: Type[MarkerTrait]
    typevar: TypeVar
    param: Any

    __slots__ = ("trait", "typevar", "param")

    def __init__(self, trait: Type[MarkerTrait], typevar: TypeVar, param: Any):
        self.trait = trait
        self.typevar = typevar
        self.param = param

    def export(self) -> _MarkerDict:
        k1 = trait_name(self.trait)
        k2 = self.typevar.__name__
        if isinstance(self.param, MarkerSet):
            return {k1: {k2: self.param.export()}}
        with suppress(TypeError):
            return {k1: {k2: extract_literals(self.param)}}
        return {k1: {k2: trait_name(self.param)}}

    def _value(self):
        if isinstance(self.param, MarkerSet):
            return self.param
        with suppress(TypeError):
            return extract_literals(self.param)
        return trait_name(self.param)

    def __le__(self, other: Any) -> bool:
        if not isinstance(other, Marker):
            return NotImplemented
        if self.trait != other.trait or self.typevar != other.typevar:
            return False
        if self.param is Any or other.param is Any:
            return True
        with suppress(TypeError):
            return extract_literals(self.param) == extract_literals(other.param)
        if isinstance(self.param, MarkerSet) and isinstance(other.param, MarkerSet):
            return self.param <= other.param
        return trait_name(self.param) == trait_name(other.param)

    def __str__(self):
        if isinstance(self.param, MarkerSet):
            param = str(self.param)
        else:
            param = display_as_type(self.param)
        return f"{display_as_type(self.trait)}[{self.typevar.__name__}: {param}]"

    def __repr__(self):
        return f"Marker<{self}>"


class MarkerSet:
    markers: Tuple[Marker, ...]

    __slots__ = ("markers",)

    def __init__(self, *markers: Marker):
        self.markers = markers

    def export(self) -> _MarkerDict:
        markers = {}
        for marker in self.markers:
            for trait, value in marker.export().items():
                markers.setdefault(trait, {}).update(value)
        return markers

    def _as_dict(self) -> Dict[Tuple[Type[MarkerTrait], TypeVar], Marker]:
        return {(marker.trait, marker.typevar): marker for marker in self.markers}

    def __getitem__(self, idx: Tuple[Type[MarkerTrait], TypeVar]):
        return self._as_dict()[idx]

    def __le__(self, other: Any) -> bool:
        if not isinstance(other, MarkerSet):
            return NotImplemented
        lhs = self._as_dict()
        rhs = other._as_dict()
        for (trait, typevar), rhs_marker in rhs.items():
            if (trait, typevar) not in lhs:
                return False
            lhs_marker = lhs[(trait, typevar)]
            if not lhs_marker <= rhs_marker:
                return False
        return True

    def __or__(self, other: Any) -> MarkerSet:
        if not isinstance(other, MarkerSet):
            return NotImplemented
        markers = {**self._as_dict(), **other._as_dict()}
        return MarkerSet(*markers.values())

    def __str__(self) -> str:
        return " + ".join(str(marker) for marker in self.markers)

    def __repr__(self) -> str:
        return f"MarkerSet<{self}>"

    def __iter__(self):
        return iter(self.markers)

    def __len__(self):
        return len(self.markers)

    def __bool__(self):
        return bool(self.markers)


class MarkerTrait(GenericModel):
    __markers__: ClassVar[MarkerSet]

    _impl = PrivateAttr()

    def __class_getitem__(cls, params):
        typevars = getattr(cls, "__parameters__", ())
        subclass = cast(Type[MarkerTrait], super().__class_getitem__(params))
        subclass.__markers__ = _markers_from_typevars(cls, typevars, params)
        subclass.__name__ = _ensure_unique_name(cls, subclass)
        return subclass

    def __init_subclass__(cls, *, new_marker=None, **kwargs):
        super().__init_subclass__(**kwargs)
        typevars = getattr(cls, "__parameters__", ())
        if new_marker or typevars:
            return
        markers = traits_of(cls)
        if not markers:
            return
        if not any(isinstance(marker.param, TypeVar) for marker in markers):
            _IMPLEMENTATIONS.add(cls)

    class Config:
        @staticmethod
        def schema_extra(schema: Dict[str, Any], model: Type[MarkerTrait]) -> None:
            if model in _IMPLEMENTATIONS:
                return

            trait_info(model).write_to(schema)

            impls = impl_for(model)
            union_type = _impl_union_type(*impls)

            properties = schema.setdefault("properties", {})
            properties["_impl"] = union_type


class TraitInfo(SchemaExtension):
    trait: Dict
    impl: List[Dict]


class ImplRegistry(SchemaExtension):
    definitions: Dict


def trait_info(model: Type[MarkerTrait]):
    info = traits_of(model).export()
    impl = [{"$ref": _impl_as_ref(impl)} for impl in impl_for(model)]
    return TraitInfo(trait=info, impl=impl)


def trait_name(obj: Type) -> str:
    module_name = getattr(inspect.getmodule(obj), "__name__", None)
    obj_name = getattr(obj, "__qualname__", None) or getattr(obj, "__name__", None)
    if not obj_name:
        return display_as_type(obj)
    if not module_name:
        return obj_name
    return f"{module_name}:{obj_name}"


def traits_of(*items: Any) -> MarkerSet:
    traits: List[Type[MarkerTrait]] = []
    markers: List[MarkerSet] = []

    for item in items:
        if isinstance(item, MarkerSet):
            markers.append(item)
        else:
            if hasattr(item, "mro"):
                traits.append(item)
            else:
                traits.append(type(item))

    marker_map: Dict[Tuple[Type[MarkerTrait], TypeVar], Any] = {}

    for trait in traits:
        for cls in reversed(trait.mro()):
            marker_set = getattr(cls, "__markers__", None)
            if isinstance(marker_set, MarkerSet):
                markers.append(marker_set)
            else:
                typevars = getattr(cls, "__parameters__", ())
                for typevar in typevars:
                    marker_map[cls, typevar] = typevar

    for marker_set in markers:
        marker_map.update({k: v.param for k, v in marker_set._as_dict().items()})

    return MarkerSet(*(Marker(t, v, p) for (t, v), p in marker_map.items()))


def impl_for(*traits: Type[MarkerTrait]) -> FrozenSet[Type[MarkerTrait]]:
    target: MarkerSet = MarkerSet()
    for trait in traits:
        target |= traits_of(trait)
    implementations: Set[Type[MarkerTrait]] = set()
    for impl in _IMPLEMENTATIONS:
        if target <= traits_of(impl):
            implementations.add(impl)
    return frozenset(implementations)


def register_implementations(*impls: Type[MarkerTrait]):
    pass


def with_implementation_schema(schema: Dict[str, Any]):
    ref_prefix = ImplRegistry.get_ref_prefix("definitions")
    impl_schema = create_schema([*_IMPLEMENTATIONS], ref_prefix=ref_prefix)
    impl_schema.setdefault("definitions", {})
    ImplRegistry.parse_obj(impl_schema).write_to(schema)
    return schema


def _markers_from_typevars(
    trait: Type[MarkerTrait],
    typevars: Tuple[TypeVar, ...],
    params: Any,
) -> MarkerSet:
    if not isinstance(params, tuple):
        params = (params,)

    markers: Set[Marker] = set()
    for typevar, param in zip(typevars, params):
        if isinstance(param, TypeVar):
            continue
        try:
            if not issubclass(param, MarkerTrait):
                raise TypeError
            markers.add(Marker(trait, typevar, traits_of(param)))
        except TypeError:
            markers.add(Marker(trait, typevar, param))

    return MarkerSet(*markers)


def _impl_union_type(*impls: Type[MarkerTrait]) -> Dict:
    one_of = []
    for impl in impls:
        one_of.append(
            {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "const": trait_name(impl)},
                    "options": {"$ref": _impl_as_ref(impl)},
                },
                "required": ["name", "options"],
            }
        )
    return {"oneOf": one_of}


def _impl_as_ref(impl: Type[MarkerTrait]) -> str:
    ref_prefix = ImplRegistry.get_ref_prefix("definitions")
    return f"{ref_prefix}{impl.__name__}"


def _ensure_unique_name(base: Type, subclass: Type) -> str:
    count = _CONCRETIZATION_COUNT[base]
    _CONCRETIZATION_COUNT[base] += 1
    return f"{subclass.__name__}~{count}"


_CONCRETIZATION_COUNT = defaultdict(int)
_IMPLEMENTATIONS: Set[Type[MarkerTrait]] = set()
