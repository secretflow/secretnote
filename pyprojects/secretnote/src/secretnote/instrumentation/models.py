from typing import (
    Any,
    Callable,
    Dict,
    List,
    Literal,
    Optional,
    Tuple,
    Union,
)

from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.utils.pydantic import update_forward_refs

ObjectLocation = Tuple[str, ...]
JSONKey = Union[str, int, float, bool, None]


class SnapshotRef(BaseModel):
    kind: Literal["ref"] = "ref"
    id: str


class ObjectSnapshot(BaseModel):
    kind: Literal["object"] = "object"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str


class RemoteLocationSnapshot(BaseModel):
    kind: Literal["remote_location"] = "remote_location"
    type: str

    id: str
    location: ObjectLocation


class RemoteObjectSnapshot(BaseModel):
    kind: Literal["remote_object"] = "remote_object"
    type: str

    id: str
    location: ObjectLocation


class SequenceSnapshot(BaseModel):
    kind: Literal["sequence"] = "sequence"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str
    values: List["SnapshotType"]


class MappingSnapshot(BaseModel):
    kind: Literal["mapping"] = "mapping"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str
    values: Dict[JSONKey, "SnapshotType"]


class UnboundSnapshot(BaseModel):
    kind: Literal["unbound"] = "unbound"
    annotation: str = str(Any)
    default: Optional["SnapshotType"] = None


class FunctionSignature(BaseModel):
    parameters: Dict[str, UnboundSnapshot]
    return_annotation: UnboundSnapshot


class FunctionSnapshot(BaseModel):
    kind: Literal["function"] = "function"
    type: str

    id: str
    hash: str
    module: Optional[str] = None
    name: str

    signature: Optional[FunctionSignature] = None

    local_vars: Dict[str, "SnapshotType"]
    closure_vars: Dict[str, "SnapshotType"]
    global_vars: Dict[str, "SnapshotType"]
    return_value: "SnapshotType"

    filename: Optional[str] = None
    firstlineno: Optional[int] = None
    source: Optional[str] = None
    docstring: Optional[str] = None


class SourceLocation(BaseModel):
    filename: str
    lineno: int
    func: str
    code: Optional[str]


class CheckpointInfo(BaseModel):
    api_level: Optional[int] = None
    description: Optional[str] = None


class Invocation(BaseModel):
    checkpoint: CheckpointInfo
    snapshot: FunctionSnapshot
    stackframes: List[SourceLocation]


class Checkpoint(BaseModel):
    code_hash: str
    func: Optional[Callable]
    info: CheckpointInfo = CheckpointInfo()


class LocalCallable(BaseModel):
    fn: Callable
    load_const: Tuple[int, ...] = ()


SnapshotType = Annotated[
    Union[
        SnapshotRef,
        RemoteObjectSnapshot,
        RemoteLocationSnapshot,
        FunctionSnapshot,
        MappingSnapshot,
        SequenceSnapshot,
        ObjectSnapshot,
        UnboundSnapshot,
    ],
    Field(discriminator="kind"),
]


update_forward_refs(globals())
