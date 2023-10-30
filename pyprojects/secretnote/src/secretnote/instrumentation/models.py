from datetime import datetime
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

from opentelemetry.util.types import Attributes
from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.utils.pydantic import update_forward_refs

JSONKey = Union[str, int, float, bool, None]


class SnapshotRef(BaseModel):
    kind: Literal["ref"] = "ref"
    id: str


class UnboundSnapshot(BaseModel):
    kind: Literal["unbound"] = "unbound"
    annotation: str = str(Any)


class ObjectSnapshot(BaseModel):
    kind: Literal["object"] = "object"
    type: str

    id: str
    hash: Optional[str]

    snapshot: str


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


class DeviceSnapshot(BaseModel):
    kind: Literal["device"] = "device"
    type: str

    id: str
    location: LogicalLocation


class RemoteObjectSnapshot(BaseModel):
    kind: Literal["remote_object"] = "remote_object"
    type: str

    id: str
    location: LogicalLocation
    refs: Tuple[str, ...]


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


class FunctionSignature(BaseModel):
    parameters: Dict[str, UnboundSnapshot] = {}
    return_annotation: UnboundSnapshot = UnboundSnapshot()


class FunctionSnapshot(BaseModel):
    kind: Literal["function"] = "function"
    type: str
    id: str
    hash: str
    module: Optional[str] = None
    name: str
    signature: Optional[FunctionSignature] = None
    filename: Optional[str] = None
    firstlineno: Optional[int] = None
    source: Optional[str] = None
    docstring: Optional[str] = None
    closure_vars: Dict[str, "SnapshotType"]
    global_vars: Dict[str, "SnapshotType"]


class FrameSnapshot(BaseModel):
    kind: Literal["frame"] = "frame"
    type: str
    id: str
    filename: str
    lineno: int
    func: str
    code: Optional[str]


class Semantics(BaseModel):
    api_level: Optional[int] = None
    description: Optional[str] = None


class Checkpoint(BaseModel):
    code_hash: str
    func: Optional[Callable]
    semantics: Semantics = Semantics()


SnapshotType = Annotated[
    Union[
        SnapshotRef,
        UnboundSnapshot,
        RemoteObjectSnapshot,
        DeviceSnapshot,
        FunctionSnapshot,
        MappingSnapshot,
        SequenceSnapshot,
        ObjectSnapshot,
        FunctionSnapshot,
        FrameSnapshot,
    ],
    Field(discriminator="kind"),
]


class TracedFrame(BaseModel):
    semantics: Semantics = Semantics()
    function: FunctionSnapshot
    local_vars: Dict[str, SnapshotType]
    global_vars: Dict[str, SnapshotType]
    return_value: SnapshotType
    traceback: List[FrameSnapshot]


class OpaqueTracedFrame(BaseModel):
    semantics: Semantics = Semantics()
    function: SnapshotRef
    local_vars: Dict[str, SnapshotRef]
    global_vars: Dict[str, SnapshotRef]
    return_value: SnapshotRef
    traceback: List[SnapshotRef]


class LocalCallable(BaseModel):
    fn: Callable
    load_const: Tuple[int, ...] = ()


class OTelSpanContextDict(BaseModel):
    span_id: str
    trace_id: str
    trace_state: str


class OTelSpanStatusDict(BaseModel):
    status_code: str
    description: Optional[str] = None


class OTelSpanEventDict(BaseModel):
    name: str
    attributes: Attributes
    timestamp: datetime


class OTelSpanLinkDict(BaseModel):
    attributes: Attributes
    span_context: OTelSpanContextDict


class OTelSpanResourceDict(BaseModel):
    attributes: Attributes
    schema_url: str


class OTelSpanDict(BaseModel):
    name: str
    context: OTelSpanContextDict
    kind: str
    parent_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: Optional[OTelSpanStatusDict] = None
    attributes: Attributes
    events: List[OTelSpanEventDict]
    links: List[OTelSpanLinkDict]
    resource: OTelSpanResourceDict


update_forward_refs(globals())
