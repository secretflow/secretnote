import json
import os
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional, cast

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.environment_variables import OTEL_SERVICE_NAME
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from ray.runtime_context import get_runtime_context

from .envvars import (
    OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME_SNAPSHOT,
    OTEL_PYTHON_SECRETNOTE_W3C_TRACE,
)
from .exporters import InMemorySpanExporter, JSONLinesSpanExporter
from .models import FrameSnapshot, OTelSpanDict


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
    provider = cast(TracerProvider, trace.get_tracer_provider())
    processor = SimpleSpanProcessor(
        OTLPSpanExporter(endpoint="localhost:4317", insecure=True)
    )
    provider.add_span_processor(processor)


def setup_jsonlines_exporter(prefix: str):
    output = open(
        Path.cwd() / f"{prefix}.{datetime.now().timestamp():.0f}.jsonl",
        "a+b",
    )
    provider = cast(TracerProvider, trace.get_tracer_provider())
    processor = SimpleSpanProcessor(JSONLinesSpanExporter(output))
    provider.add_span_processor(processor)


def setup_memory_exporter():
    provider = cast(TracerProvider, trace.get_tracer_provider())
    exporter = InMemorySpanExporter()
    processor = SimpleSpanProcessor(exporter)
    provider.add_span_processor(processor)
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
    from .profiler import current_profiler

    try:
        checkpoints = current_profiler.get()._checkpoints
    except LookupError:
        return fn

    context = dump_tracing_context()

    def remote_task(*args, **kwargs):
        from secretnote.instrumentation.profiler import Profiler

        os.environ.update(context)

        with Profiler(checkpoints, inherit_tracing_context()):
            return fn(*args, **kwargs)

    return remote_task


def get_frame_snapshot(span: OTelSpanDict) -> Optional[FrameSnapshot]:
    if not span.attributes:
        return None
    try:
        raw = cast(str, span.attributes[OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME_SNAPSHOT])
        return FrameSnapshot.parse_raw(raw)
    except Exception:
        return None
