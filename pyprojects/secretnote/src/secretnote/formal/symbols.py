from typing import Any, Dict, Tuple

from pydantic import BaseModel


class LogicalLocation(BaseModel):
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
