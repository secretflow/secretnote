import inspect
from itertools import chain
from typing import (
    Callable,
    Dict,
    Iterable,
    Tuple,
    cast,
)

from more_itertools import first

from secretnote.utils.warnings import peer_dependencies

from ...formal.symbols import (
    ExecExpression,
    ExpressionType,
    LocalObject,
    LogicalLocation,
    MoveExpression,
    RemoteObject,
    RevealExpression,
)
from ...models import (
    DictSnapshot,
    FunctionInfo,
    FunctionSnapshot,
    ListSnapshot,
    RemoteLocationSnapshot,
    RemoteObjectSnapshot,
    SnapshotType,
    TracedFrame,
)
from ...utils import like_pytree
from .base import Parser

Options = Tuple[Callable, Tuple[int, ...]]


class ExpressionParser(Parser[TracedFrame, Options, ExpressionType]):
    def rule_name(self, params: Options) -> str:
        func, load_const = params
        info = FunctionInfo.from_static(func, *load_const)
        return info.function_name

    def data_name(self, data: TracedFrame) -> str:
        return data.function_name

    def parse(self, func: Callable, *load_const: int):
        return super().parse((func, load_const))

    def __call__(self, data: TracedFrame):
        return super().__call__(data)


def _get_parameters(
    sig: inspect.Signature,
    args: Iterable[SnapshotType],
    kwargs: Iterable[Tuple[str, SnapshotType]],
    defaults: Iterable[Tuple[str, SnapshotType]],
):
    params: Dict[str, SnapshotType] = {k: v for k, v in defaults}
    arguments = sig.bind_partial(*args, **{k: v for k, v in kwargs}).arguments
    for name, item in arguments.items():
        param = sig.parameters[name]
        if param.kind == param.VAR_POSITIONAL:
            params.update(
                {
                    f"{name}[{index}]{subkey}": subitem
                    for index, item in enumerate(item)
                    for subkey, subitem in like_pytree(item, SnapshotType)
                }
            )
        elif param.kind == param.VAR_KEYWORD:
            params.update(
                {
                    f"{name}.{key}{subkey}": subitem
                    for key, item in item.items()
                    for subkey, subitem in like_pytree(item, SnapshotType)
                }
            )
        else:
            params.update(
                {
                    f"{name}{key}": subitem
                    for key, subitem in like_pytree(item, SnapshotType)
                }
            )
    return params


def _create_object(obj, name=None):
    if isinstance(obj, RemoteObjectSnapshot):
        return RemoteObject(name=name, ref=obj.ref, location=obj.location)
    return LocalObject(ref=obj.ref, name=name)


def _create_exec_expr(
    func: SnapshotType,
    location: LogicalLocation,
    *,
    args: Iterable[SnapshotType],
    kwargs: Iterable[Tuple[str, SnapshotType]],
    retvals: Iterable[Tuple[str, SnapshotType]],
):
    if func.kind == "function":
        name = func.name.split(".")[-1]
        defaults = {k: v for k, v in func.default_args.of_type(SnapshotType)}
    else:
        name = str(func)
        defaults = {}

    expr = ExecExpression(function=_create_object(func, name), location=location)

    try:
        if func.kind != "function" or not func.signature:
            raise TypeError

        signature = func.signature.reconstruct()
        params = _get_parameters(signature, args, kwargs, defaults.items()).items()

        for key, item in params:
            expr.boundvars.append(_create_object(item, key))

        for key, item in chain(
            func.closure_vars.of_type(SnapshotType),
            func.global_vars.of_type(SnapshotType),
        ):
            expr.freevars.append(_create_object(item, key))

    except TypeError:
        for idx, item in enumerate(args):
            expr.boundvars.append(_create_object(item, f"args[{idx}]"))
        for key, item in kwargs:
            expr.boundvars.append(_create_object(item, key))

    for key, item in retvals:
        expr.results.append(_create_object(item, key))

    return expr


def create_parser():
    with peer_dependencies("secretflow"):
        import secretflow
        from secretflow.device.proxy import _actor_wrapper

    parser = ExpressionParser()

    @parser.parse(secretflow.PYU.__call__, 1)
    def parse_pyu_call(frame: TracedFrame):
        data = frame.get_frame()
        func = data.local_vars[SnapshotType, "fn"]

        expr = _create_exec_expr(
            func=func,
            location=data.local_vars[RemoteLocationSnapshot, "self"].location,
            args=data.local_vars[ListSnapshot, "args"].to_container(SnapshotType),
            kwargs=data.local_vars[DictSnapshot, "kwargs"]
            .to_container(SnapshotType)
            .items(),
            retvals=frame.iter_retvals(),
        )

        if func.bytecode_hash == frame.well_known.identity_function:
            try:
                source = first(expr.boundvars)
                target = cast(RemoteObject, first(expr.results))
                yield MoveExpression(source=source, target=target)
                return
            except ValueError:
                pass

        yield expr

    @parser.parse(secretflow.SPU.__call__, 1)
    def parse_spu_call(frame: TracedFrame):
        data = frame.get_frame()
        yield _create_exec_expr(
            func=data.local_vars[SnapshotType, "func"],
            location=data.local_vars[RemoteLocationSnapshot, "self"].location,
            args=data.local_vars[ListSnapshot, "args"].to_container(SnapshotType),
            kwargs=data.local_vars[DictSnapshot, "kwargs"]
            .to_container(SnapshotType)
            .items(),
            retvals=frame.iter_retvals(),
        )

    @parser.parse(_actor_wrapper, 1)
    def parse_proxy_call(frame: TracedFrame):
        data = frame.get_frame()
        yield _create_exec_expr(
            func=data.local_vars[SnapshotType, "__actor_method__"],
            location=data.local_vars[RemoteObjectSnapshot, "self"].location,
            args=data.local_vars[ListSnapshot, "args"].to_container(SnapshotType),
            kwargs=data.local_vars[DictSnapshot, "kwargs"]
            .to_container(SnapshotType)
            .items(),
            retvals=frame.iter_retvals(),
        )

    @parser.parse(secretflow.device.kernels.pyu.pyu_to_pyu)
    @parser.parse(secretflow.device.kernels.pyu.pyu_to_spu)
    @parser.parse(secretflow.device.kernels.pyu.pyu_to_heu)
    @parser.parse(secretflow.device.kernels.spu.spu_to_pyu)
    @parser.parse(secretflow.device.kernels.spu.spu_to_spu)
    @parser.parse(secretflow.device.kernels.spu.spu_to_heu)
    @parser.parse(secretflow.device.kernels.heu.heu_to_pyu)
    @parser.parse(secretflow.device.kernels.heu.heu_to_spu)
    @parser.parse(secretflow.device.kernels.heu.heu_to_heu)
    def parse_data_conversion(frame: TracedFrame):
        data = frame.get_frame()

        source = data.local_vars[RemoteObjectSnapshot, "self"]
        target_name, target = cast(
            Tuple[str, RemoteObjectSnapshot],
            first(frame.iter_retvals()),
        )

        yield MoveExpression(
            source=_create_object(source),
            target=_create_object(target, target_name),
        )

    @parser.parse(secretflow.reveal)
    def parse_reveal(frame: TracedFrame):
        expr = RevealExpression(items=[], results=[])

        inputs = frame.get_frame().local_vars[SnapshotType, "func_or_object"]

        for key, item in like_pytree(inputs, SnapshotType):
            expr.items.append(_create_object(item, key))

        for key, item in frame.iter_retvals():
            expr.results.append(_create_object(item, key))

        yield expr

    @parser.parse(secretflow.SPU.psi_csv)
    @parser.parse(secretflow.SPU.psi_df)
    def parse_routine(frame: TracedFrame):
        data = frame.get_frame()
        yield _create_exec_expr(
            func=frame.function.bind(FunctionSnapshot, frame.variables),
            location=data.local_vars[RemoteLocationSnapshot, "self"].location,
            args=[],
            kwargs=filter(
                lambda v: v[0] != "self",
                data.local_vars.of_type(SnapshotType),
            ),
            retvals=frame.iter_retvals(),
        )

    return parser
