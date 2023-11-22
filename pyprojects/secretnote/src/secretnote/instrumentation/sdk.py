import inspect
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from types import ModuleType
from typing import (
    Callable,
    List,
    Optional,
    Type,
    cast,
)

from opentelemetry import trace
from opentelemetry.sdk.environment_variables import OTEL_SERVICE_NAME
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

from secretnote.utils.warnings import development_preview_warning

from .checkpoint import CheckpointGroup
from .envvars import (
    OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME,
    OTEL_PYTHON_SECRETNOTE_W3C_TRACE,
)
from .exporters import InMemorySpanExporter, JSONLinesSpanExporter
from .models import (
    APILevel,
    DictSnapshot,
    FrameInfoSnapshot,
    FrameSnapshot,
    FunctionSnapshot,
    ListSnapshot,
    ObjectSnapshot,
    ObjectTracer,
    OTelSpanDict,
    RemoteLocationSnapshot,
    RemoteObjectSnapshot,
    Semantics,
    TracedFrame,
)
from .profiler import Profiler
from .snapshot import (
    qualname,
)


def setup_tracing(service_name: Optional[str] = None):
    current_provider = trace.get_tracer_provider()

    if not isinstance(current_provider, trace.ProxyTracerProvider):
        # already initialized
        return

    if service_name:
        os.environ[OTEL_SERVICE_NAME] = name = service_name
    else:
        name = os.environ.get(OTEL_SERVICE_NAME, "unknown service")

    resource = Resource(attributes={SERVICE_NAME: name})
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)


def setup_tracing_in_ray_worker():
    from ray.runtime_context import get_runtime_context

    runtime_ctx = get_runtime_context()
    setup_tracing(runtime_ctx.get_worker_id())


def setup_debug_exporter():
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

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
        recorders = current_profiler.get()._recorders
    except LookupError:
        return fn

    context = dump_tracing_context()

    def remote_task(*args, **kwargs):
        from secretnote.instrumentation.profiler import Profiler

        os.environ.update(context)

        with Profiler(checkpoints, recorders, inherit_tracing_context()):
            return fn(*args, **kwargs)

    return remote_task


def get_traced_frame(span: OTelSpanDict) -> Optional[TracedFrame]:
    if not span.attributes:
        return None
    try:
        raw = cast(str, span.attributes[OTEL_PYTHON_SECRETNOTE_PROFILER_FRAME])
        return TracedFrame.parse_raw(raw)
    except Exception:
        return None


def default_checkpoints():
    import fed
    import fed._private.fed_call_holder
    import ray
    import ray.actor
    import ray.remote_function
    import secretflow
    import secretflow.distributed
    import secretflow.stats
    from secretflow.device.proxy import _actor_wrapper

    checkpoints = CheckpointGroup()
    add_function = checkpoints.add_function

    for fn in (
        ray.remote_function.RemoteFunction._remote,
        ray.actor.ActorClass._remote,
        ray.actor.ActorMethod._remote,
        ray.get,
        ray.wait,
        fed.get,
        fed.send,
        fed.recv,
        fed._private.fed_call_holder.FedCallHolder.internal_remote,
        secretflow.SPU.infeed_shares,
        secretflow.SPU.outfeed_shares,
    ):
        add_function(fn, semantics=Semantics(api_level=APILevel.IMPLEMENTATION))

    for fn in (
        secretflow.device.kernels.pyu.pyu_to_pyu,
        secretflow.device.kernels.pyu.pyu_to_spu,
        secretflow.device.kernels.pyu.pyu_to_heu,
        secretflow.device.kernels.spu.spu_to_pyu,
        secretflow.device.kernels.spu.spu_to_spu,
        secretflow.device.kernels.spu.spu_to_heu,
        secretflow.device.kernels.heu.heu_to_pyu,
        secretflow.device.kernels.heu.heu_to_spu,
        secretflow.device.kernels.heu.heu_to_heu,
        secretflow.reveal,
    ):
        add_function(fn, semantics=Semantics(api_level=APILevel.INVARIANT))

    for fn, *load_const in (
        (secretflow.PYU.__call__, 1),
        (secretflow.SPU.__call__, 1),
        (_actor_wrapper, 1),
    ):
        add_function(fn, *load_const, semantics=Semantics(api_level=APILevel.INVARIANT))

    return checkpoints


class ModuleTracer(ObjectTracer):
    @classmethod
    def typecheck(cls, x) -> bool:
        return isinstance(x, ModuleType)

    @classmethod
    def trace(cls, x):
        raise NotImplementedError


class BuiltinSymbolTracer(ObjectTracer):
    @classmethod
    def typecheck(cls, x) -> bool:
        module = inspect.getmodule(x)
        if module is None:
            return False
        if sys.version_info >= (3, 10):
            stdlib_names = sys.stdlib_module_names
        else:
            stdlib_names = sys.builtin_module_names
        return module.__name__ in stdlib_names and qualname(type(x)) in (
            "abc.ABCMeta",
            "builtins.type",
            "builtins.builtin_function_or_method",
            "builtins.builtin_function",
            "builtins.method_descriptor",
            "builtins.wrapper_descriptor",
        )

    @classmethod
    def trace(cls, x):
        raise NotImplementedError


def default_snapshot_rules() -> List[Type[ObjectTracer]]:
    return [
        ModuleTracer,
        BuiltinSymbolTracer,
        FunctionSnapshot,
        FrameInfoSnapshot,
        FrameSnapshot,
        RemoteObjectSnapshot,
        RemoteLocationSnapshot,
        ListSnapshot,
        DictSnapshot,
        ObjectSnapshot,
    ]


def create_profiler():
    development_preview_warning()
    setup_tracing()
    checkpoints = default_checkpoints()
    snapshot_rules = default_snapshot_rules()
    return Profiler(checkpoints, snapshot_rules)
