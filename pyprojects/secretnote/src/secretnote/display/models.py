from typing import Dict, List, Optional

from pydantic import BaseModel

from secretnote.formal.symbols import ExpressionType
from secretnote.instrumentation.models import FunctionCheckpoint, SnapshotType
from secretnote.utils.pydantic import Reference

from .parsers.dependencies import DependencyGraph
from .react.component import ComponentProps


class Frame(BaseModel):
    span_id: str
    parent_span_id: Optional[str]
    start_time: str
    end_time: str

    epoch: int = 0
    checkpoints: List[FunctionCheckpoint] = []
    function: Optional[Reference] = None
    frame: Optional[Reference] = None
    retval: Optional[Reference] = None
    expressions: List[ExpressionType] = []

    inner_frames: List["Frame"] = []


class VisualizationProps(ComponentProps):
    variables: Dict[str, SnapshotType]
    frames: List[Frame]
    dependencies: DependencyGraph
