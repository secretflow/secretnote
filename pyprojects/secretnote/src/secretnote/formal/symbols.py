from itertools import zip_longest
from math import nan
from typing import Iterator, Optional, Tuple, Union

from pydantic import BaseModel
from typing_extensions import TypeAlias


class IO(BaseModel):
    def __eq__(self, other: object) -> bool:
        return isinstance(other, IO)

    def __hash__(self) -> int:
        return hash(self.__class__)

    def __str__(self) -> str:
        return "IO()"


class Location(BaseModel):
    kind: str
    parties: Tuple[str, ...]

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.kind == other.kind
            and self.parties == other.parties
        )

    def __hash__(self) -> int:
        return hash((self.kind, self.parties))

    def __str__(self) -> str:
        return f"{self.kind}({', '.join(self.parties)})"


Reference: TypeAlias = str

FunctionArgument = Union[Reference, IO]
FunctionResult = Union[Location, IO]


class Function(BaseModel):
    arguments: Tuple[FunctionArgument, ...]
    result: FunctionResult

    name: Optional[str] = None

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.arguments == other.arguments
            and self.result == other.result
        )

    def __hash__(self) -> int:
        return hash((self.arguments, self.result))

    def __iter__(self):
        yield from self.arguments
        yield self.result

    def __str__(self) -> str:
        return " -> ".join(str(x) for x in self)


class Program(BaseModel):
    applications: Tuple[Union[Function, "Program"], ...]

    name: Optional[str] = None

    def __len__(self) -> int:
        return sum(
            (len(line) if isinstance(line, Program) else 1)
            for line in self.applications
        )

    def __iter__(self) -> Iterator[Function]:
        for line in self.applications:
            if isinstance(line, Program):
                yield from line
            else:
                yield line

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, type(self)):
            return False
        return all(x == y for x, y in zip_longest(self, other, fillvalue=nan))

    def __hash__(self) -> int:
        return hash(tuple(self))

    def __str__(self) -> str:
        lines = [f"  {i} :: {f}" for i, f in enumerate(self, start=1)]
        return "Program(\n" + "\n".join(lines) + "\n)"
