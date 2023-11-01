import inspect
from itertools import chain
from typing import (
    Callable,
    Dict,
    Iterable,
    Optional,
    Tuple,
    cast,
    overload,
)

import secretflow
from more_itertools import first

from secretnote.formal.symbols import (
    ExecExpression,
    ExpressionType,
    LocalObject,
    LogicalLocation,
    MoveExpression,
    RemoteObject,
    RevealExpression,
)
from secretnote.instrumentation.models import (
    DictSnapshot,
    FunctionInfo,
    ListSnapshot,
    RemoteLocationSnapshot,
    RemoteObjectSnapshot,
    SnapshotType,
    TracedFrame,
)
from secretnote.utils.pydantic import to_flattened_pytree

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


parser = ExpressionParser()


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
            params.update({f"{name}[{i}]": item for i, item in enumerate(item)})
        elif param.kind == param.VAR_KEYWORD:
            params.update({k: item for k, item in item.items()})
        else:
            params.update({name: item})
    return params


@overload
def _create_object(obj: SnapshotType, name: Optional[str] = None) -> LocalObject:
    ...


@overload
def _create_object(
    obj: RemoteObjectSnapshot,
    name: Optional[str] = None,
) -> RemoteObject:
    ...


def _create_object(obj, name=None):
    if name is None:
        name = str(obj)
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


@parser.parse(secretflow.PYU.__call__, 1)
def _(frame: TracedFrame):
    data = frame.get_frame()
    return _create_exec_expr(
        func=data.local_vars[SnapshotType, "fn"],
        location=data.local_vars[RemoteLocationSnapshot, "self"].location,
        args=data.local_vars[ListSnapshot, "args"].to_container(SnapshotType),
        kwargs=data.local_vars[DictSnapshot, "kwargs"]
        .to_container(SnapshotType)
        .items(),
        retvals=frame.iter_retvals(),
    )


@parser.parse(secretflow.SPU.__call__, 1)
def _(frame: TracedFrame):
    data = frame.get_frame()
    return _create_exec_expr(
        func=data.local_vars[SnapshotType, "func"],
        location=data.local_vars[RemoteLocationSnapshot, "self"].location,
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
def _(frame: TracedFrame):
    data = frame.get_frame()

    source = data.local_vars[RemoteObjectSnapshot, "self"]
    _, target = cast(Tuple[str, RemoteObjectSnapshot], first(frame.iter_retvals()))

    return MoveExpression(source=_create_object(source), target=_create_object(target))


@parser.parse(secretflow.reveal)
def _(frame: TracedFrame):
    expr = RevealExpression(items=[], results=[])

    inputs = frame.get_frame().local_vars[SnapshotType, "func_or_object"]

    for key, item in to_flattened_pytree(inputs):
        expr.items.append(_create_object(item, key))

    for key, item in frame.iter_retvals():
        expr.results.append(_create_object(item, key))

    return expr
