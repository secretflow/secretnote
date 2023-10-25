import io
from typing import Iterable, Protocol, Sequence

from opentelemetry.sdk.trace import ReadableSpan
from opentelemetry.sdk.trace.export import SpanExporter, SpanExportResult


class SpanReader(Protocol):
    def get_finished_spans(self) -> Iterable[ReadableSpan]:
        ...


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
