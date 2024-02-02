from typing import BinaryIO, Iterable, Protocol

import orjson
from opentelemetry.sdk.trace import ReadableSpan
from opentelemetry.sdk.trace.export import SpanExportResult
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter as _InMemorySpanExporter,
)
from opentelemetry.sdk.util import ns_to_iso_str
from opentelemetry.trace import format_span_id

from .models import OTelSpanDict


def parse_span(raw_span: ReadableSpan) -> OTelSpanDict:
    parent_id = None
    if raw_span.parent is not None:
        parent_id = f"0x{format_span_id(raw_span.parent.span_id)}"

    start_time = None
    if raw_span._start_time:
        start_time = ns_to_iso_str(raw_span._start_time)

    end_time = None
    if raw_span._end_time:
        end_time = ns_to_iso_str(raw_span._end_time)

    if raw_span._status is not None:
        status = {}
        status["status_code"] = str(raw_span._status.status_code.name)
        if raw_span._status.description:
            status["description"] = raw_span._status.description
    else:
        status = None

    f_span = {}

    f_span["name"] = raw_span._name
    f_span["context"] = raw_span._format_context(raw_span._context)
    f_span["kind"] = str(raw_span.kind)
    f_span["parent_id"] = parent_id
    f_span["start_time"] = start_time
    f_span["end_time"] = end_time
    if status:
        f_span["status"] = status
    f_span["attributes"] = raw_span._format_attributes(raw_span._attributes)
    f_span["events"] = raw_span._format_events(raw_span._events)
    f_span["links"] = raw_span._format_links(raw_span._links)
    f_span["resource"] = {
        "attributes": dict(raw_span.resource._attributes),
        "schema_url": raw_span.resource._schema_url,
    }

    return OTelSpanDict.parse_obj(f_span)


class SpanReader(Protocol):
    def iter_spans(self) -> Iterable[OTelSpanDict]: ...


class InMemorySpanExporter(_InMemorySpanExporter, SpanReader):
    def iter_spans(self) -> Iterable[OTelSpanDict]:
        for span in self.get_finished_spans():
            yield parse_span(span)


class JSONLinesSpanExporter(_InMemorySpanExporter):
    def __init__(self, file: BinaryIO) -> None:
        self.file = file

    def flush(self) -> None:
        for span in self._finished_spans:
            span_dict = parse_span(span)
            self.file.write(orjson.dumps(span_dict.dict(exclude_none=True)))
            self.file.write(b"\n")

    def force_flush(self, timeout_millis: int = 30000) -> bool:
        self.flush()
        self.file.flush()
        return True

    def export(self, spans):
        result = super().export(spans)
        if result is SpanExportResult.SUCCESS:
            self.flush()
        return result
