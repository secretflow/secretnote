import sys
from types import FrameType, FunctionType
from typing import Any, Dict, Hashable, List, Optional, Tuple

from more_itertools import partition
from opentelemetry import context, trace
from opentelemetry.sdk.trace import ReadableSpan
from opentelemetry.sdk.trace.export import SpanExporter, SpanExportResult
from secretflow.device.device import DeviceObject
from secretflow.device.device.pyu import PYU, PYUObject
from secretflow.device.device.spu import SPU, SPUObject


def format_invariant(primitive: str, *symbols: str, label: Optional[str] = None):
    fn = f"{primitive}({', '.join(symbols)})"
    if label:
        fn = f"{fn} [{label}]"
    return fn


def get_binding_locations(obj: DeviceObject) -> str:
    if isinstance(obj, PYUObject):
        return format_invariant("cleartext", obj.device.party)
    elif isinstance(obj, SPUObject):
        return format_invariant("spu", *obj.device.actors)
    else:
        raise NotImplementedError


class SourceCodePathFinder:
    def __init__(self):
        self._cache: dict[str, str] = {}

    def find(self, filename: str) -> str:
        if filename in self._cache:
            return self._cache[filename]

        prefixes = sorted(sys.path, key=len, reverse=True)

        for path in prefixes:
            if filename.startswith(path):
                self._cache[filename] = relpath = filename[len(path) + 1 :]
                return relpath

        return filename


def get_reference(x: Any) -> Optional[Hashable]:
    if isinstance(x, PYUObject):
        return x.data
    elif isinstance(x, SPUObject):
        return tuple(x.shares_name)
    return None


class ProfilingInstrumentor:
    def __init__(self):
        self.tracer = trace.get_tracer(__name__)
        self.spans: List[Tuple[int, trace.Span]] = []
        self.pathfinder = SourceCodePathFinder()
        self.references: Dict[Hashable, Tuple[str, trace.SpanContext]] = {}

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if event == "return" and self.spans:
            frame_id, span = self.spans[-1]
            if frame_id == id(frame):
                if not isinstance(arg, list):
                    arg = [arg]
                for x in arg:
                    ref = get_reference(x)
                    if ref is None:
                        continue
                    self.references[ref] = (
                        format_invariant(type(x).__name__, get_binding_locations(x)),
                        span.get_span_context(),
                    )
                span.end()
                self.spans.pop()
            return

        if event == "call":
            if span := self._maybe_trace(frame):
                trace.set_span_in_context(span)
                self.spans.append((id(frame), span))

    def _maybe_trace(self, frame: FrameType) -> Optional[trace.Span]:
        co = frame.f_code
        fn = co.co_name
        lineno = frame.f_lineno
        path = self.pathfinder.find(co.co_filename)
        source = f"{co.co_filename}:{lineno}"

        def find_upstream_refs(args: Tuple):
            ctxs: List[trace.SpanContext] = []
            for sym in args:
                ref = get_reference(sym)
                if ref is None:
                    continue
                upstream = self.references.get(ref)
                if upstream:
                    ctxs.append(upstream[1])
            return ctxs

        if path == "secretflow/device/device/pyu.py":
            if fn == "wrapper":
                pyu: PYU = frame.f_locals["self"]
                fn: FunctionType = frame.f_locals["fn"]

                args: Tuple = frame.f_locals["args"]
                cleartext_data, bound_symbols = partition(
                    lambda x: isinstance(x, DeviceObject),
                    args,
                )

                bound_symbols = [*bound_symbols]
                cleartext_data = [*cleartext_data]

                if not bound_symbols:
                    primitive = "use_cleartext"
                else:
                    primitive = "use_function"

                invariants = format_invariant(
                    primitive,
                    pyu.party,
                    label=fn.__qualname__,
                )

                data_descriptions = [type(x).__name__ for x in cleartext_data]

                ctx = self._enter_context()
                span = self.tracer.start_span(
                    invariants,
                    context=ctx,
                    links=[
                        trace.Link(upstream) for upstream in find_upstream_refs(args)
                    ],
                )
                span.set_attributes(
                    {
                        "primitive": primitive,
                        "code.source": source,
                        "data.location": pyu.party,
                        "data.function": fn.__qualname__,
                        "data.function.source": f"{fn.__code__.co_filename}"
                        f":{fn.__code__.co_firstlineno}",
                        "data.cleartext": data_descriptions,
                    }
                )
                return span

        if path == "secretflow/device/kernels/pyu.py":
            if fn == "pyu_to_spu":
                pyu: PYUObject = frame.f_locals["self"]
                spu: SPU = frame.f_locals["spu"]

                primitive = "use_relocation"
                invariants = format_invariant(
                    primitive,
                    pyu.device.party,
                    format_invariant("spu", *spu.actors),
                )

                ctx = self._enter_context()
                span = self.tracer.start_span(
                    invariants,
                    context=ctx,
                    links=[
                        trace.Link(upstream) for upstream in find_upstream_refs((pyu,))
                    ],
                )
                span.set_attributes(
                    {
                        "primitive": primitive,
                        "code.source": source,
                        "data.location": pyu.device.party,
                        "data.destination": ", ".join(spu.actors),
                    }
                )
                return span

            if fn == "pyu_to_pyu":
                src: PYUObject = frame.f_locals["self"]
                dst: PYU = frame.f_locals["pyu"]

                primitive = "use_relocation"
                invariants = [primitive, src.device.party, dst.party]

                ctx = self._enter_context()
                span = self.tracer.start_span(
                    format_invariant(*invariants),
                    context=ctx,
                    links=[
                        trace.Link(upstream) for upstream in find_upstream_refs((src,))
                    ],
                )
                span.set_attributes(
                    {
                        "primitive": primitive,
                        "code.source": source,
                        "data.location": src.device.party,
                        "data.destination": dst.party,
                    }
                )
                return span

        if path == "secretflow/device/kernels/spu.py":
            if fn == "spu_to_pyu":
                spu: SPUObject = frame.f_locals["self"]
                pyu: PYU = frame.f_locals["pyu"]
                source_location = format_invariant("spu", *spu.device.actors)

                primitive = "use_relocation"
                invariants = format_invariant(primitive, pyu.party, source_location)

                ctx = self._enter_context()
                span = self.tracer.start_span(
                    invariants,
                    context=ctx,
                    links=[
                        trace.Link(upstream) for upstream in find_upstream_refs((spu,))
                    ],
                )
                span.set_attributes(
                    {
                        "primitive": primitive,
                        "code.source": source,
                        "data.location": source_location,
                        "data.destination": pyu.party,
                    }
                )
                return span

        if path == "secretflow/device/device/spu.py":
            if fn == "wrapper":
                spu: SPU = frame.f_locals["self"]
                fn: FunctionType = frame.f_locals["func"]

                args: Tuple = frame.f_locals["args"]

                primitive = "use_function"

                source_location = format_invariant("spu", *spu.actors)
                invariants = format_invariant(
                    primitive,
                    source_location,
                    label=fn.__qualname__,
                )

                ctx = self._enter_context()
                span = self.tracer.start_span(
                    invariants,
                    context=ctx,
                    links=[
                        trace.Link(upstream) for upstream in find_upstream_refs(args)
                    ],
                )
                span.set_attributes(
                    {
                        "primitive": primitive,
                        "code.source": source,
                        "data.location": source_location,
                        "data.function": fn.__qualname__,
                        "data.function.source": f"{fn.__code__.co_filename}"
                        f":{fn.__code__.co_firstlineno}",
                    }
                )
                return span

    def _enter_context(self):
        if self.spans:
            frame_id, curr_span = self.spans[-1]
            return trace.set_span_in_context(curr_span)
        else:
            return context.get_current()

    def start(self):
        ctx = self._enter_context()
        span = self.tracer.start_span("root", context=ctx)
        self.spans.append((id(self), span))
        sys.setprofile(self)

    def stop(self):
        sys.setprofile(None)
        for _id, span in self.spans:
            span.end()
        self.spans = []
        self.references.clear()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.stop()
        return False


class MermaidExporter(SpanExporter):
    def __init__(self):
        self.items: List[ReadableSpan] = []

    def export(self, spans: List[ReadableSpan], **kwargs) -> SpanExportResult:
        self.items.extend(spans)
        return SpanExportResult.SUCCESS

    def graph(self):
        lines = []
        counter = 0

        def next_id():
            nonlocal counter
            counter += 1
            return f"id{counter}"

        for span in self.items:
            if span.name == "root":
                root_id = span.context.span_id
                break
        else:
            return ""

        for span in sorted(self.items, key=lambda x: x.start_time):
            id_ = f"{span.context.span_id:x}"[:7]
            span: ReadableSpan
            primitive = span.attributes.get("primitive")
            if not primitive:
                continue
            if span.parent.span_id != root_id:
                continue
            if primitive == "use_cleartext":
                location = span.attributes.get("data.location")
                for item in span.attributes.get("data.cleartext", []):
                    lines.append(f"{next_id()}[{item}]" f' --> {id_}["{location}"]')
            elif primitive == "use_relocation":
                location = span.attributes.get("data.destination")
                for ref in span.links:
                    parent_id = f"{ref.context.span_id:x}"[:7]
                    lines.append(f'{parent_id} --> |relocate| {id_}["{location}"]')
            elif primitive == "use_function":
                location = span.attributes.get("data.location")
                for ref in span.links:
                    parent_id = f"{ref.context.span_id:x}"[:7]
                    lines.append(f'{parent_id} --> |argument| {id_}["{location}"]')
        return "\n".join(["graph TD", *map(lambda t: f"  {t}", lines)])

    def shutdown(self) -> None:
        pass
