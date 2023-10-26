from datetime import datetime
from typing import List, Optional

from opentelemetry.util.types import Attributes
from pydantic import BaseModel


class SpanContextDict(BaseModel):
    span_id: str
    trace_id: str
    trace_state: str


class SpanStatusDict(BaseModel):
    status_code: str
    description: Optional[str] = None


class SpanEventDict(BaseModel):
    name: str
    attributes: Attributes
    timestamp: datetime


class SpanLinkDict(BaseModel):
    attributes: Attributes
    span_context: SpanContextDict


class SpanResourceDict(BaseModel):
    attributes: Attributes
    schema_url: str


class SpanDict(BaseModel):
    name: str
    context: SpanContextDict
    kind: str
    parent_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: Optional[SpanStatusDict] = None
    attributes: Attributes
    events: List[SpanEventDict]
    links: List[SpanLinkDict]
    resource: SpanResourceDict
