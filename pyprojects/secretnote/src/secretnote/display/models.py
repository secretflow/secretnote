from typing import Dict, List

import orjson
from pydantic import BaseModel

from secretnote.instrumentation.models import (
    LogicalLocation,
    OpaqueTracedFrame,
    SnapshotType,
)
from secretnote.utils.pydantic import ORJSONConfig


class TimelineSpan(BaseModel):
    span_id: str
    start_time: str
    end_time: str
    rank: int
    frame: OpaqueTracedFrame
    timeline: List["TimelineSpan"] = []


class Timeline(BaseModel):
    locations: List[LogicalLocation] = []
    variables: Dict[str, Dict[int, SnapshotType]] = {}
    object_refs: Dict[str, int] = {}
    timeline: List[TimelineSpan] = []


def orjson_dumps(v, *, default):
    # orjson.dumps returns bytes, to match standard json.dumps we need to decode
    return orjson.dumps(v, default=default).decode()


class Visualization(BaseModel):
    timeline: Timeline

    class Config(ORJSONConfig):
        pass
