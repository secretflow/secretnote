import io
from typing import List, Protocol, Sequence

from opentelemetry.sdk.trace import ReadableSpan
from opentelemetry.sdk.trace.export import SpanExporter, SpanExportResult


class ReadableExporter(Protocol):
    def get_spans(self) -> Sequence[ReadableSpan]:
        ...


class InMemoryExporter(SpanExporter):
    def __init__(self) -> None:
        self.spans: List[ReadableSpan] = []

    def export(self, spans: Sequence[ReadableSpan]):
        self.spans.extend(spans)
        return SpanExportResult.SUCCESS

    def get_spans(self) -> Sequence[ReadableSpan]:
        return self.spans


class JSONLinesSpanExporter(SpanExporter):
    def __init__(self, file: io.StringIO) -> None:
        self.file = file

    def export(self, spans: Sequence[ReadableSpan]):
        for span in spans:
            self.file.write(span.to_json(indent=2))
            self.file.write("\n")
        return SpanExportResult.SUCCESS

    def force_flush(self, timeout_millis: int = 30000) -> bool:
        self.file.flush()
        return True
