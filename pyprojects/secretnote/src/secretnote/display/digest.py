import inspect
from functools import wraps
from typing import Dict, Iterable, List, Tuple, cast, overload

import networkx as nx
from more_itertools import first

from secretnote.formal.symbols import (
    ExecExpression,
    LocalObject,
    MoveExpression,
    RemoteObject,
    RevealExpression,
)
from secretnote.instrumentation.models import (
    DictSnapshot,
    ListSnapshot,
    OTelSpanDict,
    RemoteLocationSnapshot,
    RemoteObjectSnapshot,
    SnapshotType,
    TracedFrame,
)
from secretnote.instrumentation.sdk import get_traced_frame
from secretnote.utils.logging import log_dev_exception
from secretnote.utils.pydantic import to_flattened_pytree

from .models import Frame


def conditional(qualname: str):
    def wrapper(fn):
        @wraps(fn)
        def wrapped(self, frame: TracedFrame):
            if frame.get_function_name() != qualname:
                raise NotImplementedError
            return fn(self, frame)

        return wrapped

    return wrapper


def get_parameters(
    sig: inspect.Signature,
    args: List[SnapshotType],
    kwargs: Dict[str, SnapshotType],
    defaults: Dict[str, SnapshotType],
):
    params: Dict[str, SnapshotType] = {**defaults}
    arguments = sig.bind_partial(*args, **kwargs).arguments
    for name, item in arguments.items():
        param = sig.parameters[name]
        if param.kind == param.VAR_POSITIONAL:
            params.update({f"{name}[{i}]": item for i, item in enumerate(item)})
        elif param.kind == param.VAR_KEYWORD:
            params.update({k: item for k, item in item.items()})
        else:
            params.update({name: item})
    return params


class TimelineDigest:
    def __init__(self):
        self.frames: Dict[str, Frame] = {}
        self.object_refs: Dict[str, RemoteObject] = {}
        self.trace_data: Dict[str, TracedFrame] = {}
        self.variables: Dict[str, SnapshotType] = {}
        self.call_graph = nx.DiGraph()
        self.data_graph = nx.DiGraph()
        self._pending_frames: Dict[str, Frame] = {}

    def feed(self, raw_frame: OTelSpanDict):
        span_id = raw_frame.context.span_id
        parent_span_id = raw_frame.parent_id
        start_time = raw_frame.start_time
        end_time = raw_frame.end_time
        self._pending_frames[span_id] = Frame(
            span_id=span_id,
            parent_span_id=parent_span_id,
            start_time=start_time.isoformat(),
            end_time=end_time.isoformat(),
        )
        frame_data = get_traced_frame(raw_frame)
        if frame_data is not None:
            self.trace_data[span_id] = frame_data

    def digest(self):
        for frame in sorted(self._pending_frames.values(), key=lambda f: f.end_time):
            del self._pending_frames[frame.span_id]
            self.frames[frame.span_id] = frame
            self.digest_ordered(frame)

    def digest_ordered(self, frame: Frame):
        if frame.parent_span_id:
            self.call_graph.add_edge(frame.parent_span_id, frame.span_id)
        else:
            self.call_graph.add_node(frame.span_id)

        frame_data = self.trace_data.get(frame.span_id)
        if frame_data is None:
            return

        span_stack = self.call_stack(frame.span_id)
        frame_stack = [
            f for f in (self.trace_data.get(sid) for sid in span_stack) if f is not None
        ]
        semantics = [f.semantics for f in frame_stack]

        frame.epoch = len(self.frames)
        frame.semantics = semantics
        frame.function = frame_data.function
        frame.frame = frame_data.frame
        frame.retval = frame_data.retval
        self.variables.update(frame_data.variables)

        for expr_fn in (
            self.digest_pyu_exec,
            self.digest_spu_exec,
            self.digest_pyu_to_pyu,
            self.digest_pyu_to_spu,
            self.digest_pyu_to_heu,
            self.digest_spu_to_pyu,
            self.digest_spu_to_spu,
            self.digest_spu_to_heu,
            self.digest_heu_to_pyu,
            self.digest_heu_to_spu,
            self.digest_heu_to_heu,
            self.digest_reveal,
        ):
            try:
                expr = expr_fn(frame_data)
            except NotImplementedError:
                continue
            except Exception as e:
                log_dev_exception(e)
                continue
            else:
                frame.expression = expr
                break

    @conditional("secretflow.device.device.pyu.PYU.__call__.<locals>.wrapper")
    def digest_pyu_exec(self, frame: TracedFrame):
        data = frame.get_frame()
        device = data.local_vars[RemoteLocationSnapshot, "self"]
        fn = data.local_vars[SnapshotType, "fn"]
        args = data.local_vars[ListSnapshot, "args"].to_container(SnapshotType)
        kwargs = data.local_vars[DictSnapshot, "kwargs"].to_container(SnapshotType)
        retvals = frame.iter_retvals()
        return self.create_exec_expr(fn, device, args, kwargs, retvals)

    @conditional("secretflow.device.device.spu.SPU.__call__.<locals>.wrapper")
    def digest_spu_exec(self, frame: TracedFrame):
        data = frame.get_frame()
        device = data.local_vars[RemoteLocationSnapshot, "self"]
        fn = data.local_vars[SnapshotType, "func"]
        args = data.local_vars[ListSnapshot, "args"].to_container(SnapshotType)
        kwargs = data.local_vars[DictSnapshot, "kwargs"].to_container(SnapshotType)
        retvals = frame.iter_retvals()
        return self.create_exec_expr(fn, device, args, kwargs, retvals)

    @conditional("secretflow.device.kernels.pyu.pyu_to_pyu")
    def digest_pyu_to_pyu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.pyu.pyu_to_spu")
    def digest_pyu_to_spu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.pyu.pyu_to_heu")
    def digest_pyu_to_heu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.spu.spu_to_pyu")
    def digest_spu_to_pyu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.spu.spu_to_spu")
    def digest_spu_to_spu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.spu.spu_to_heu")
    def digest_spu_to_heu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.heu.heu_to_pyu")
    def digest_heu_to_pyu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.heu.heu_to_spu")
    def digest_heu_to_spu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.kernels.heu.heu_to_heu")
    def digest_heu_to_heu(self, frame: TracedFrame):
        return self.create_move_expr(frame)

    @conditional("secretflow.device.driver.reveal")
    def digest_reveal(self, frame: TracedFrame):
        expr = RevealExpression(items=[], results=[])

        inputs = frame.get_frame().local_vars[SnapshotType, "func_or_object"]

        for path, item in to_flattened_pytree(inputs):
            expr.items.append(self.create_object(path, item))

        for path, item in frame.iter_retvals():
            expr.results.append(self.create_object(path, item))

        return expr

    @property
    def top_level_calls(self):
        return [span_id for span_id, degree in self.call_graph.in_degree if degree == 0]

    def call_stack(self, span_id: str) -> List[str]:
        for top in self.top_level_calls:
            try:
                return cast(List[str], nx.shortest_path(self.call_graph, top, span_id))
            except nx.NetworkXNoPath:
                continue
        else:
            raise ValueError(f"Cannot find path to {span_id}")

    @overload
    def create_object(self, name: str, obj: RemoteObjectSnapshot) -> RemoteObject:
        ...

    @overload
    def create_object(self, name: str, obj: SnapshotType) -> LocalObject:
        ...

    def create_object(self, name, obj):
        if isinstance(obj, RemoteObjectSnapshot):
            if obj.ref not in self.object_refs:
                numbering = len(self.object_refs) + 1
                self.object_refs[obj.ref] = symbol = RemoteObject(
                    name=name,
                    ref=obj.ref,
                    location=obj.location,
                    numbering=numbering,
                )
                return symbol
            return self.object_refs[obj.ref]
        return LocalObject(ref=obj.ref, name=name)

    def create_exec_expr(
        self,
        fn: SnapshotType,
        device: RemoteLocationSnapshot,
        args: List[SnapshotType],
        kwargs: Dict[str, SnapshotType],
        retvals: Iterable[Tuple[str, SnapshotType]],
    ):
        if fn.kind == "function":
            name = fn.name.split(".")[-1]
            defaults = {k: v for k, v in fn.default_args.of_type(SnapshotType)}
        else:
            name = str(fn)
            defaults = {}

        expr = ExecExpression(
            function=LocalObject(ref=fn.ref, name=name),
            location=device.location,
            boundvars=[],
            freevars=[],
            results=[],
        )

        bound_args = False

        if fn.kind == "function" and fn.signature:
            signature = fn.signature.reconstruct()
            try:
                params = get_parameters(signature, args, kwargs, defaults).items()
                expr.boundvars = [self.create_object(k, v) for k, v in params]
                bound_args = True
            except TypeError:
                pass

        if not bound_args:
            expr.boundvars.extend(
                self.create_object(f"args[{i}]", item) for i, item in enumerate(args)
            )
            expr.boundvars.extend(
                self.create_object(k, item) for k, item in kwargs.items()
            )

        if fn.kind == "function":
            expr.freevars.extend(
                self.create_object(k, item)
                for k, item in fn.closure_vars.of_type(SnapshotType)
            )

        for name, item in retvals:
            expr.results.append(self.create_object(name, item))

        return expr

    def create_move_expr(self, frame: TracedFrame):
        data = frame.get_frame()
        source = data.local_vars[RemoteObjectSnapshot, "self"]
        _, target = first(frame.iter_retvals())
        return MoveExpression(
            source=self.create_object("<source>", source),
            target=cast(RemoteObject, self.create_object("<target>", target)),
        )
