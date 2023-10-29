from typing import BinaryIO, Iterable, Protocol

import orjson
from opentelemetry.sdk.trace.export import SpanExportResult
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter as _InMemorySpanExporter,
)

from secretnote.utils.opentelemetry import SpanDict


class SpanReader(Protocol):
    def iter_spans(self) -> Iterable[SpanDict]:
        ...


class InMemorySpanExporter(_InMemorySpanExporter, SpanReader):
    def iter_spans(self) -> Iterable[SpanDict]:
        for span in self.get_finished_spans():
            yield SpanDict.parse_raw(span.to_json())


class JSONLinesSpanExporter(_InMemorySpanExporter):
    def __init__(self, file: BinaryIO) -> None:
        self.file = file

    def flush(self) -> None:
        for span in self._finished_spans:
            span_dict = SpanDict.parse_raw(span.to_json())
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
