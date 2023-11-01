from typing import Any, Dict, List, Literal, Tuple, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated


class LogicalLocation(BaseModel):
    numbering: int = 0

    kind: str
    parties: Tuple[str, ...]
    parameters: Dict[str, Any] = {}

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.kind == other.kind
            and self.parameters == other.parameters
            and self.parties == other.parties
        )

    def __hash__(self) -> int:
        return hash((self.kind, self.parties, *self.parameters.items()))

    def __str__(self) -> str:
        return f"{self.kind}[{', '.join(self.parties)}]"

    def as_key(self) -> str:
        args = [
            self.kind,
            *self.parties,
            *[f"{k}={v}" for k, v in self.parameters.items()],
        ]
        return ":".join(args)


class RemoteObject(BaseModel):
    numbering: int = 0
    ref: str
    name: str
    location: LogicalLocation

    def __eq__(self, other: object) -> bool:
        return (
            isinstance(other, type(self))
            and self.ref == other.ref
            and self.numbering == other.numbering
        )

    def __hash__(self) -> int:
        return hash((self.numbering, self.ref))

    def __str__(self) -> str:
        if self.numbering == 0:
            return f"{self.location.kind[0]}({self.ref[-7:]})"
        return f"{self.location.kind[0]}({self.numbering})"

    def as_key(self):
        return self.ref


class LocalObject(BaseModel):
    ref: str
    name: str

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
    boundvars: List[Union[LocalObject, RemoteObject]]
    freevars: List[Union[LocalObject, RemoteObject]]
    results: List[Union[LocalObject, RemoteObject]]

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
        label = self.function.name

        return (
            f"{result_str} := {location_str}. let {invariant_str} in exec({label})"
            f" | ({static_args_str}) + ({freevars_str})"
        )


class MoveExpression(BaseModel):
    kind: Literal["move"] = "move"
    source: RemoteObject
    target: RemoteObject

    def __str__(self):
        return f"{self.target} <~~ {self.source} / move to {self.target.location}"


class RevealExpression(BaseModel):
    kind: Literal["reveal"] = "reveal"
    items: List[RemoteObject]
    results: List[LocalObject]

    def __str__(self) -> str:
        output = ", ".join(map(str, self.results))
        inputs = ", ".join(map(str, self.items))
        return f"{output} <== reveal {inputs}"


ExpressionType = Annotated[
    Union[ExecExpression, MoveExpression, RevealExpression],
    Field(discriminator="kind"),
]
