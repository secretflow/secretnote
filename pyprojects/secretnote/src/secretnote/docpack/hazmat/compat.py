from contextlib import suppress
from enum import Enum
from importlib import import_module
from pathlib import Path
from typing import (
    Any,
    Dict,
    Generic,
    List,
    Optional,
    Tuple,
    Type,
    TypeVar,
    Union,
    cast,
    get_args,
    get_origin,
)

from loguru import logger
from pydantic import BaseModel, Field, create_model
from pydantic.fields import ModelField
from typing_extensions import override

from secretnote.utils.warnings import peer_dependencies

from .markers import MarkerTrait, traits_of
from .primitives import (
    ALICE,
    AXIS_COLUMNS,
    BOB,
    IO,
    Exclusive,
    OptionsType,
    OutputRef,
    Partitioned,
    Public,
    SecretShared,
    T,
    Task,
    TaskMetadata,
)

with peer_dependencies("secretflow"):
    import pandas as pd
    from google.protobuf.json_format import MessageToDict
    from google.protobuf.message import Message
    from secretflow.component.component import Component, IoType, TableColParam
    from secretflow.component.data_utils import DistDataType
    from secretflow.data.vertical import VDataFrame
    from secretflow.ml.boost.sgb_v import SgbModel
    from secretflow.ml.boost.ss_xgb_v import XgbModel
    from secretflow.ml.linear import SSGLM, LinearModel


def always_union(annotation) -> Tuple:
    origin = annotation
    while True:
        args = get_args(origin)
        origin = get_origin(origin)
        if origin is Union:
            return tuple(t for subtype in args for t in always_union(subtype))
        if origin is None:
            return args or (annotation,)


class _BinRunningRule(BaseModel):
    ...


class _PreprocessingRule(BaseModel):
    ...


class _Report(BaseModel):
    ...


_TMessage = TypeVar("_TMessage")


class _ProtoMessage(MarkerTrait, Generic[_TMessage]):
    pass


class _TableColParam(BaseModel):
    pass


def _create_attr_field(info, comp_domain: str, comp_name: str, module: str):
    def _get_field_info():
        attr_type = info["type"]
        value_accessor = _SUPPORTED_TYPES[attr_type][1]
        atomic = info.get("atomic", {})
        if atomic.get("lowerBoundEnabled", False):
            lower_bound = value_accessor(atomic.get("lowerBound", {}), 0)
            if atomic.get("lowerBoundInclusive", False):
                ge = lower_bound
                gt = None
            else:
                ge = None
                gt = lower_bound
        else:
            ge = None
            gt = None
        if atomic.get("upperBoundEnabled", False):
            upper_bound = value_accessor(atomic.get("upperBound", {}))
            if atomic.get("upperBoundInclusive", False):
                le = upper_bound
                lt = None
            else:
                le = None
                lt = upper_bound
        else:
            le = None
            lt = None
        is_optional = bool(info.get("atomic", {}).get("isOptional"))
        default = value_accessor(atomic.get("defaultValue", {}))
        if default is None:
            if not is_optional:
                default = ...
            else:
                if value_accessor is f:
                    default = 0.0
                elif value_accessor is i64:
                    default = 0
                elif value_accessor is s:
                    default = ""
                elif value_accessor is b:
                    default = False
        return Field(
            default=default,
            description=info.get("desc"),
            gt=gt,
            ge=ge,
            lt=lt,
            le=le,
        )

    def _get_type_hint():
        attr_type = info["type"]
        is_optional = bool(info.get("atomic", {}).get("isOptional"))
        maybe_element_type = attr_type[:-1]

        if maybe_element_type in _SUPPORTED_TYPES:
            is_list = True
            attr_type = maybe_element_type
        else:
            is_list = False

        def inner_annotation(attr_type, info):
            anno = _SUPPORTED_TYPES[attr_type][0]
            enum_accessor = _SUPPORTED_TYPES[attr_type][2]
            if enum_accessor:
                enums = enum_accessor(info.get("atomic", {}).get("allowedValues", {}))
                if enums:
                    enum_name = f'{comp_domain}.{comp_name}.{info["name"]}_Enum'
                    enum = Enum(
                        enum_name,
                        names={str(e): e for e in enums},
                        module=module,
                        type=anno,
                    )
                    return enum
                else:
                    return _SUPPORTED_TYPES[attr_type][0]
            else:
                return _SUPPORTED_TYPES[attr_type][0]

        annotation = inner_annotation(attr_type, info)
        if is_list:
            annotation = List[annotation]
        if is_optional:
            annotation = Optional[annotation]

        return annotation

    def _import_pb(path: str) -> Type[Message]:
        _import = import_module("secretflow.spec.extend")
        for name in path.split("."):
            _import = getattr(_import, name)
        return cast(Type[Message], _import)

    if info["type"] in ("AT_STRUCT_GROUP", "AT_UNION_GROUP", "AT_SF_TABLE_COL"):
        raise NotImplementedError(info["type"])

    if info["type"] == "AT_CUSTOM_PROTOBUF":
        pb_path = info["customProtobufCls"]
        return (
            _ProtoMessage[_import_pb(pb_path)],
            Field(..., description=info.get("desc")),
        )

    return (_get_type_hint(), _get_field_info())


def _create_io_field(info: Dict, comp_domain: str, comp_name: str, module: str):
    subtypes = []

    def _get_io_options():
        col_params = info.get("attrs")

        if not col_params:
            return type(None)

        fields = {}

        for param in col_params:
            param_t = List[str]
            try:
                min_items = int(param["colMinCntInclusive"])
            except Exception:
                min_items = None
            try:
                max_items = int(param["colMaxCntInclusive"])
            except Exception:
                max_items = None
            param_f = Field(
                ...,
                description=param.get("desc"),
                min_items=min_items,
                max_items=max_items,
            )
            fields[param["name"]] = (param_t, param_f)

        model_name = f'{comp_domain}.{comp_name}.{info["name"]}_Options'

        return create_model(
            model_name,
            __base__=_TableColParam,
            __module__=module,
            **fields,
        )

    Options = _get_io_options()

    for io_type in info["types"]:
        if io_type == DistDataType.INDIVIDUAL_TABLE:
            subtypes.append(
                IO[
                    pd.DataFrame,
                    Exclusive,
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.VERTICAL_TABLE:
            subtypes.append(
                IO[
                    VDataFrame,
                    Partitioned[Union[ALICE, BOB], AXIS_COLUMNS],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.SS_SGD_MODEL:
            subtypes.append(
                IO[
                    LinearModel,
                    SecretShared[Union[ALICE, BOB]],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.SS_GLM_MODEL:
            subtypes.append(
                IO[
                    SSGLM,
                    SecretShared[Union[ALICE, BOB]],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.SGB_MODEL:
            subtypes.append(
                IO[
                    SgbModel,
                    Partitioned[Union[ALICE, BOB], AXIS_COLUMNS],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.SS_XGB_MODEL:
            subtypes.append(
                IO[
                    XgbModel,
                    SecretShared[Union[ALICE, BOB]],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.BIN_RUNNING_RULE:
            subtypes.append(
                IO[
                    _BinRunningRule,
                    Partitioned[Union[ALICE, BOB], AXIS_COLUMNS],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.PREPROCESSING_RULE:
            subtypes.append(
                IO[
                    _PreprocessingRule,
                    Partitioned[Union[ALICE, BOB], AXIS_COLUMNS],
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.REPORT:
            subtypes.append(
                IO[
                    _Report,
                    Public,
                    Options,
                ]
            )
            continue

        if io_type == DistDataType.READ_DATA:
            subtypes.append(
                IO[
                    Path,
                    Exclusive,
                    Options,
                ]
            )
            continue

    if not subtypes:
        return (Any, Field(..., description=info.get("desc")))

    if len(subtypes) == 1:
        return (subtypes[0], Field(..., description=info.get("desc")))

    union_t = Union[tuple(subtypes)]  # type: ignore
    return (union_t, Field(..., description=info.get("desc")))


def component_to_recipe(comp: "Component") -> Type[Task]:
    fields = {}

    c_domain, c_name = comp.domain, comp.name
    c_callback = getattr(comp, "_Component__eval_callback", None)
    c_module = getattr(c_callback, "__module__", comp.__module__)

    for attr in getattr(comp, "_Component__comp_attr_decls", ()):
        info = MessageToDict(attr)
        fields[info["name"]] = _create_attr_field(info, c_domain, c_name, c_module)

    for input_decl in getattr(comp, "_Component__input_io_decls", ()):
        info = MessageToDict(input_decl)
        fields[info["name"]] = _create_io_field(info, c_domain, c_name, c_module)

    for output_decl in getattr(comp, "_Component__output_io_decls", ()):
        info = MessageToDict(output_decl)
        field_t, field_f = _create_io_field(info, c_domain, c_name, c_module)
        field_t = OutputRef[field_t]
        field_f.default = field_t()
        fields[info["name"]] = (field_t, field_f)

    ext = TaskMetadata(
        vendor="secretflow",
        namespace=c_domain,
        name=c_name,
        version=comp.version,
    )

    class _Task(Task):
        @override
        @classmethod
        def _task_metadata(cls):
            return ext

    task_t = create_model(c_name, __base__=_Task, __module__=c_domain, **fields)
    task_t.__doc__ = comp.desc

    return task_t


def recipe_to_component(task: Type[Task]) -> "Component":
    ext = task._task_metadata()

    comp = Component(
        name=ext.name,
        domain=ext.namespace,
        version=ext.version,
        desc=task.__doc__ or "",
    )

    def is_io(field_info):
        return all(issubclass(c, IO) for c in always_union(field_info.type_))

    def is_output_ref(field_info):
        return all(issubclass(c, OutputRef) for c in always_union(field_info.type_))

    def get_atomic_type(field: ModelField) -> Optional[str]:
        anno = field.type_
        if issubclass(anno, _ProtoMessage):
            return "AT_CUSTOM_PROTOBUF"
        if issubclass(anno, bool):
            return "AT_BOOL"
        if issubclass(anno, int):
            return "AT_INT"
        if issubclass(anno, float):
            return "AT_FLOAT"
        if issubclass(anno, str):
            return "AT_STRING"
        if get_origin(anno) == List:
            elem_t = get_args(anno)[0]
            return get_atomic_type(elem_t)
        return None

    def infer_dd_type(marker):
        if traits_of(marker) <= traits_of(IO[pd.DataFrame, Exclusive, Any]):
            return DistDataType.INDIVIDUAL_TABLE
        if traits_of(marker) <= traits_of(IO[VDataFrame, Any, Any]):
            return DistDataType.VERTICAL_TABLE
        if traits_of(marker) <= traits_of(IO[LinearModel, Any, Any]):
            return DistDataType.SS_SGD_MODEL
        if traits_of(marker) <= traits_of(IO[SSGLM, Any, Any]):
            return DistDataType.SS_GLM_MODEL
        if traits_of(marker) <= traits_of(IO[SgbModel, Any, Any]):
            return DistDataType.SGB_MODEL
        if traits_of(marker) <= traits_of(IO[XgbModel, Any, Any]):
            return DistDataType.SS_XGB_MODEL
        if traits_of(marker) <= traits_of(IO[_BinRunningRule, Any, Any]):
            return DistDataType.BIN_RUNNING_RULE
        if traits_of(marker) <= traits_of(IO[_PreprocessingRule, Any, Any]):
            return DistDataType.PREPROCESSING_RULE
        if traits_of(marker) <= traits_of(IO[_Report, Any, Any]):
            return DistDataType.REPORT
        if traits_of(marker) <= traits_of(IO[Path, Exclusive, Any]):
            return DistDataType.READ_DATA
        return None

    for field_name, field in task.__fields__.items():

        def warn_unsupported(name=field_name, type_=field.type_, model=task):
            logger.warning(
                "Unsupported field {name} of type {type} in {model}",
                name=name,
                type=type_,
                model=task,
            )

        if is_io(field):
            marker = field.type_

            dd_types = []
            col_params = {}

            for constituent in always_union(marker):
                dd_type = infer_dd_type(constituent)
                if dd_type is None:
                    warn_unsupported()
                    continue
                dd_types.append(dd_type)

                with suppress(KeyError, TypeError):
                    option_t = traits_of(constituent)[IO, OptionsType].param
                    if issubclass(option_t, _TableColParam):
                        for attr_name, attr_field in option_t.__fields__.items():
                            col_params[attr_name] = TableColParam(
                                name=attr_name,
                                desc=attr_field.field_info.description,
                                col_min_cnt_inclusive=attr_field.field_info.min_items,
                                col_max_cnt_inclusive=attr_field.field_info.max_items,
                            )

            comp.io(
                io_type=IoType.INPUT,
                name=field_name,
                desc=field.field_info.description,
                types=dd_types,
                col_params=list(col_params.values()),
            )

            continue

        if is_output_ref(field):
            marker = traits_of(field.type_)[OutputRef, T].param

            dd_types = []
            col_params = {}

            for constituent in always_union(marker):
                dd_type = infer_dd_type(constituent)
                if dd_type is None:
                    warn_unsupported()
                    continue
                dd_types.append(dd_type)

                with suppress(KeyError, TypeError):
                    option_t = traits_of(constituent)[(IO, OptionsType)].param
                    if issubclass(option_t, _TableColParam):
                        for attr_name, attr_field in option_t.__fields__.items():
                            col_params[attr_name] = TableColParam(
                                name=attr_name,
                                desc=attr_field.field_info.description,
                                col_min_cnt_inclusive=attr_field.field_info.min_items,
                                col_max_cnt_inclusive=attr_field.field_info.max_items,
                            )

            comp.io(
                io_type=IoType.OUTPUT,
                name=field_name,
                desc=field.field_info.description,
                types=dd_types,
                col_params=list(col_params.values()),
            )

            continue

        at_type = get_atomic_type(field)

        if at_type is None:
            logger.warning(
                "Unsupported field {name} of type {type} in {model}",
                name=field_name,
                type=field.type_,
                model=task,
            )
            continue

        is_list = get_origin(field.type_) in (List, list)

        if issubclass(field.type_, Enum):
            allowed_values = [e.value for e in field.type_]
        else:
            allowed_values = None

        if field.field_info.gt is not None:
            lower_bound = field.field_info.gt
            lower_bound_inclusive = False
        elif field.field_info.ge is not None:
            lower_bound = field.field_info.ge
            lower_bound_inclusive = True
        else:
            lower_bound = None
            lower_bound_inclusive = None

        if field.field_info.lt is not None:
            upper_bound = field.field_info.lt
            upper_bound_inclusive = False
        elif field.field_info.le is not None:
            upper_bound = field.field_info.le
            upper_bound_inclusive = True
        else:
            upper_bound = None
            upper_bound_inclusive = None

        if at_type == "AT_STRING":
            comp.str_attr(
                name=field_name,
                desc=field.field_info.description,
                is_list=is_list,
                is_optional=not field.required,
                default_value=field.default,
                allowed_values=allowed_values,  # type: ignore
                list_max_length_inclusive=field.field_info.max_items,
                list_min_length_inclusive=field.field_info.min_items,
            )
            continue

        if at_type == "AT_INT":
            comp.int_attr(
                name=field_name,
                desc=field.field_info.description,
                is_list=is_list,
                is_optional=not field.required,
                default_value=field.default,
                allowed_values=allowed_values,  # type: ignore
                lower_bound=lower_bound,  # type: ignore
                lower_bound_inclusive=lower_bound_inclusive,  # type: ignore
                upper_bound=upper_bound,  # type: ignore
                upper_bound_inclusive=upper_bound_inclusive,  # type: ignore
                list_max_length_inclusive=field.field_info.max_items,
                list_min_length_inclusive=field.field_info.min_items,
            )
            continue

        if at_type == "AT_FLOAT":
            comp.float_attr(
                name=field_name,
                desc=field.field_info.description,
                is_list=is_list,
                is_optional=not field.required,
                default_value=field.default,
                allowed_values=allowed_values,  # type: ignore
                lower_bound=lower_bound,  # type: ignore
                lower_bound_inclusive=lower_bound_inclusive,  # type: ignore
                upper_bound=upper_bound,  # type: ignore
                upper_bound_inclusive=upper_bound_inclusive,  # type: ignore
                list_max_length_inclusive=field.field_info.max_items,
                list_min_length_inclusive=field.field_info.min_items,
            )
            continue

        if at_type == "AT_BOOL":
            comp.bool_attr(
                name=field_name,
                desc=field.field_info.description,
                is_list=is_list,
                is_optional=not field.required,
                default_value=field.default,
                list_max_length_inclusive=field.field_info.max_items,
                list_min_length_inclusive=field.field_info.min_items,
            )
            continue

        if at_type == "AT_CUSTOM_PROTOBUF":
            comp.custom_pb_attr(
                name=field_name,
                desc=field.field_info.description,
                pb_cls=traits_of(field.type_)[_ProtoMessage, _TMessage].param,
            )
            continue

        warn_unsupported()

    return comp


def f(d, default=None):
    try:
        return float(d["f"])
    except ValueError:
        return d["f"]
    except KeyError:
        return default


def i64(d, default=None):
    try:
        return int(d["i64"])
    except ValueError:
        return d["i64"]
    except KeyError:
        return default


def s(d, default=None):
    try:
        return str(d["s"])
    except KeyError:
        return default


def b(d, default=None):
    try:
        return bool(d["b"])
    except KeyError:
        return default


def fs(d, default=None):
    try:
        return [f({"f": v}) for v in d["fs"]]
    except KeyError:
        return default


def i64s(d, default=None):
    try:
        return [i64({"i64": v}) for v in d["i64s"]]
    except KeyError:
        return default


def ss(d, default=None):
    try:
        return [s({"s": v}) for v in d["ss"]]
    except KeyError:
        return default


def bs(d, default=None):
    try:
        return [b({"b": v}) for v in d["bs"]]
    except KeyError:
        return default


_SUPPORTED_TYPES = {
    "AT_FLOAT": (float, f, fs),
    "AT_INT": (int, i64, i64s),
    "AT_STRING": (str, s, ss),
    "AT_BOOL": (bool, b, bs),
}
