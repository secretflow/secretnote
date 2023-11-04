from typing import Any, Dict, List, Literal, Optional, Tuple, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated


class LogicalLocation(BaseModel):
    kind: Literal["location"] = "location"

    type: str
    parties: Tuple[str, ...]
    parameters: Dict[str, Any] = {}

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.type == other.type
            and self.parameters == other.parameters
            and self.parties == other.parties
        )

    def __hash__(self) -> int:
        return hash((self.type, self.parties, *self.parameters.items()))

    def __str__(self) -> str:
        return f"{self.type}[{', '.join(self.parties)}]"

    def as_key(self) -> str:
        args = [
            self.type,
            *self.parties,
            *[f"{k}={v}" for k, v in self.parameters.items()],
        ]
        return ":".join(args)


class RemoteObject(BaseModel):
    kind: Literal["remote_object"] = "remote_object"

    numbering: int = -1
    ref: str
    location: LogicalLocation

    name: Optional[str] = None

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.ref == other.ref
            and self.numbering == other.numbering
        )

    def __hash__(self) -> int:
        return hash((self.numbering, self.ref))

    def __str__(self) -> str:
        if self.numbering == -1:
            return f"{self.location.type[0]}({self.ref[-7:]})"
        return f"{self.location.type[0]}({self.numbering})"

    def as_key(self):
        return self.ref


class LocalObject(BaseModel):
    kind: Literal["local_object"] = "local_object"
    ref: str
    name: Optional[str] = None

    def __eq__(self, other: object) -> bool:
        return isinstance(other, type(self)) and self.ref == other.ref

    def __hash__(self) -> int:
        return hash((self.ref,))

    def __str__(self) -> str:
        if not self.name:
            return self.ref
        return self.name

    def as_key(self):
        return self.ref


class ExecExpression(BaseModel):
    kind: Literal["exec"] = "exec"
    function: LocalObject
    location: LogicalLocation
    boundvars: List[Union[LocalObject, RemoteObject]] = []
    freevars: List[Union[LocalObject, RemoteObject]] = []
    results: List[Union[LocalObject, RemoteObject]] = []

    def __str__(self) -> str:
        invariants = []
        static_args = []

        for arg in self.boundvars:
            if isinstance(arg, RemoteObject):
                invariants.append(arg)
            else:
                static_args.append(arg)

        invariant_str = ", ".join(map(str, invariants)) or "()"
        static_args_str = ", ".join(map(str, static_args))
        freevars_str = ", ".join(map(str, self.freevars))
        result_str = ", ".join(map(str, self.results))

        location_str = str(self.location)
        label = self.function.name if self.function else "?"

        return (
            f"{result_str} ::= {location_str}. let {invariant_str} in {label}"
            f" | ({static_args_str}) + ({freevars_str})"
        )

    def objects(self):
        if self.function:
            yield self.function
        yield from self.boundvars
        yield from self.freevars
        yield from self.results


class MoveExpression(BaseModel):
    kind: Literal["move"] = "move"
    source: Union[RemoteObject, LocalObject]
    target: RemoteObject

    def __str__(self):
        return f"{self.target} <~~ {self.source} / move to {self.target.location}"

    def objects(self):
        yield self.source
        yield self.target


class RevealExpression(BaseModel):
    kind: Literal["reveal"] = "reveal"
    items: List[Union[RemoteObject, LocalObject]]
    results: List[LocalObject]

    def __str__(self) -> str:
        output = ", ".join(map(str, self.results))
        inputs = ", ".join(map(str, self.items))
        return f"{output} <== reveal {inputs}"

    def objects(self):
        yield from self.items
        yield from self.results


ExpressionType = Annotated[
    Union[ExecExpression, MoveExpression, RevealExpression],
    Field(discriminator="kind"),
]

ObjectSymbolType = Annotated[
    Union[RemoteObject, LocalObject],
    Field(discriminator="kind"),
]

SymbolType = Annotated[
    Union[LogicalLocation, ObjectSymbolType],
    Field(discriminator="kind"),
]
