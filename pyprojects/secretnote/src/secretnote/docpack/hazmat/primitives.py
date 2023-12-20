from __future__ import annotations

from abc import ABC, abstractmethod
from typing import (
    Any,
    Callable,
    Generic,
    Literal,
    Optional,
    Type,
    TypeVar,
)

from pydantic import Field
from pydantic.generics import GenericModel

from .markers import MarkerTrait
from .schema import SchemaExtension


class Ownership(MarkerTrait):
    pass


OwnershipType = TypeVar("OwnershipType", bound=Ownership)
Owner = TypeVar("Owner")


class Public(Ownership):
    pass


class Exclusive(Ownership, Generic[Owner]):
    pass


class Partitioned(
    Ownership,
    Generic[Owner, TypeVar("PartitionAxis", bound=Literal["index", "columns"])],
):
    pass


class SecretShared(Ownership, Generic[Owner]):
    pass


DataType = TypeVar("DataType")
OptionsType = TypeVar("OptionsType")


class IO(MarkerTrait, Generic[DataType, OwnershipType, OptionsType]):
    options: OptionsType


T = TypeVar("T", bound=IO)


class OutputRef(MarkerTrait, Generic[T]):
    io: Optional[T] = None

    def __get__(self, obj, objtype=None) -> T:
        ...

    def __set__(self, obj, value: T) -> None:
        ...


class TaskOptions(GenericModel, ABC):
    pass


class TaskMetadata(SchemaExtension):
    vendor: str
    namespace: str
    name: str
    version: str


class Task(TaskOptions, ABC):
    @abstractmethod
    def impl(self) -> None:
        ...

    @classmethod
    def _task_metadata(cls):
        return TaskMetadata(
            vendor=cls.__module__.split(".")[0],
            namespace=cls.__module__,
            name=cls.__name__,
            version="0.0.0",
        )

    @staticmethod
    def output(annotation: Type[T]) -> Callable[[Any], OutputRef[T]]:
        def wrapper(stub):
            ref = OutputRef[annotation]()
            return Field(default=ref)

        return wrapper

    class Config:
        @staticmethod
        def schema_extra(schema, model: Type[Task]):
            model._task_metadata().write_to(schema)


ALICE = Literal["alice"]
BOB = Literal["bob"]
CAROL = Literal["carol"]
DAVE = Literal["dave"]

AXIS_INDEX = Literal["index"]
"""Partition along the index axis, i.e. horizontally."""

AXIS_COLUMNS = Literal["columns"]
"""Partition along the column axis, i.e. vertically."""
