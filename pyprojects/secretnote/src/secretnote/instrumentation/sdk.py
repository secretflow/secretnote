import json
import os
from datetime import datetime
from pathlib import Path
from typing import BinaryIO, Callable, Iterable, Optional, Protocol

import orjson
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.environment_variables import OTEL_SERVICE_NAME
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExportResult
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter as _InMemorySpanExporter,
)
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from ray.runtime_context import get_runtime_context

from secretnote.utils.opentelemetry import SpanDict

from .envvars import OTEL_PYTHON_SECRETNOTE_W3C_TRACE
from .profiler import Profiler, current_profiler


def setup_tracing(service_name: Optional[str] = None):
    if service_name:
        os.environ[OTEL_SERVICE_NAME] = name = service_name
    else:
        name = os.environ.get(OTEL_SERVICE_NAME, "unknown service")
    resource = Resource(attributes={SERVICE_NAME: name})
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)


def setup_tracing_in_ray_worker():
    runtime_ctx = get_runtime_context()
    setup_tracing(runtime_ctx.get_worker_id())


def setup_debug_exporter():
    provider = trace.get_tracer_provider()
    processor = SimpleSpanProcessor(
        OTLPSpanExporter(endpoint="localhost:4317", insecure=True)
    )
    provider.add_span_processor(processor)


def setup_jsonlines_exporter(prefix: str):
    output = open(
        Path.cwd() / f"{prefix}.{datetime.now().timestamp():.0f}.jsonl",
        "a+b",
    )
    provider = trace.get_tracer_provider()
    processor = SimpleSpanProcessor(JSONLinesSpanExporter(output))
    provider.add_span_processor(processor)  # pyright: ignore[reportGeneralTypeIssues]


def setup_memory_exporter():
    provider = trace.get_tracer_provider()
    exporter = InMemorySpanExporter()
    processor = SimpleSpanProcessor(exporter)
    provider.add_span_processor(processor)  # pyright: ignore[reportGeneralTypeIssues]
    return exporter


def inherit_tracing_context():
    try:
        propagated_trace = json.loads(os.environ[OTEL_PYTHON_SECRETNOTE_W3C_TRACE])
    except Exception:
        propagated_trace = {}

    return TraceContextTextMapPropagator().extract(propagated_trace)


def dump_tracing_context():
    carrier = {}
    TraceContextTextMapPropagator().inject(carrier)
    return {OTEL_PYTHON_SECRETNOTE_W3C_TRACE: json.dumps(carrier)}


def remote_trace(fn: Callable) -> Callable:
    try:
        checkpoints = current_profiler.get().checkpoints
    except LookupError:
        return fn

    context = dump_tracing_context()

    def remote_task(*args, **kwargs):
        os.environ.update(context)

        with Profiler(checkpoints, inherit_tracing_context()):
            return fn(*args, **kwargs)

    return remote_task


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
