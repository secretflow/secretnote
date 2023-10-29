from typing import Dict, List

from pydantic import BaseModel

from secretnote.instrumentation.models import FrameSnapshot, LogicalLocation


class TimelineSpan(BaseModel):
    span_id: str
    start_time: str
    end_time: str

    index: int
    frame: FrameSnapshot

    timeline: List["TimelineSpan"] = []


class Timeline(BaseModel):
    timeline: List[TimelineSpan] = []
    locations: List[LogicalLocation] = []
    object_refs: Dict[str, int] = {}


class Visualization(BaseModel):
    timeline: Timeline
