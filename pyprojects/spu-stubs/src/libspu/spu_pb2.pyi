from typing import ClassVar as _ClassVar
from typing import Iterable as _Iterable
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper

ABY3: ProtocolKind
CHEETAH: ProtocolKind
DESCRIPTOR: _descriptor.FileDescriptor
DOT: XLAPrettyPrintKind
DT_F16: DataType
DT_F32: DataType
DT_F64: DataType
DT_I1: DataType
DT_I16: DataType
DT_I32: DataType
DT_I64: DataType
DT_I8: DataType
DT_INVALID: DataType
DT_U16: DataType
DT_U32: DataType
DT_U64: DataType
DT_U8: DataType
FM128: FieldType
FM32: FieldType
FM64: FieldType
FT_INVALID: FieldType
HTML: XLAPrettyPrintKind
MLIR_HLO: SourceIRType
PROT_INVALID: ProtocolKind
PT_BOOL: PtType
PT_CF32: PtType
PT_CF64: PtType
PT_F16: PtType
PT_F32: PtType
PT_F64: PtType
PT_I128: PtType
PT_I16: PtType
PT_I32: PtType
PT_I64: PtType
PT_I8: PtType
PT_INVALID: PtType
PT_U128: PtType
PT_U16: PtType
PT_U32: PtType
PT_U64: PtType
PT_U8: PtType
REF2K: ProtocolKind
SEMI2K: ProtocolKind
TEXT: XLAPrettyPrintKind
VIS_INVALID: Visibility
VIS_PUBLIC: Visibility
VIS_SECRET: Visibility
XLA: SourceIRType

class CompilationSource(_message.Message):
    __slots__ = ["input_visibility", "ir_txt", "ir_type"]
    INPUT_VISIBILITY_FIELD_NUMBER: _ClassVar[int]
    IR_TXT_FIELD_NUMBER: _ClassVar[int]
    IR_TYPE_FIELD_NUMBER: _ClassVar[int]
    input_visibility: _containers.RepeatedScalarFieldContainer[Visibility]
    ir_txt: bytes
    ir_type: SourceIRType
    def __init__(
        self,
        ir_type: _Optional[_Union[SourceIRType, str]] = ...,
        ir_txt: _Optional[bytes] = ...,
        input_visibility: _Optional[_Iterable[_Union[Visibility, str]]] = ...,
    ) -> None: ...

class CompilerOptions(_message.Message):
    __slots__ = [
        "disable_div_sqrt_rewrite",
        "disable_maxpooling_optimization",
        "disable_reduce_truncation_optimization",
        "disable_select_optimization",
        "disable_sqrt_plus_epsilon_rewrite",
        "disallow_mix_types_opts",
        "enable_optimize_denominator_with_broadcast",
        "enable_pretty_print",
        "pretty_print_dump_dir",
        "xla_pp_kind",
    ]
    DISABLE_DIV_SQRT_REWRITE_FIELD_NUMBER: _ClassVar[int]
    DISABLE_MAXPOOLING_OPTIMIZATION_FIELD_NUMBER: _ClassVar[int]
    DISABLE_REDUCE_TRUNCATION_OPTIMIZATION_FIELD_NUMBER: _ClassVar[int]
    DISABLE_SELECT_OPTIMIZATION_FIELD_NUMBER: _ClassVar[int]
    DISABLE_SQRT_PLUS_EPSILON_REWRITE_FIELD_NUMBER: _ClassVar[int]
    DISALLOW_MIX_TYPES_OPTS_FIELD_NUMBER: _ClassVar[int]
    ENABLE_OPTIMIZE_DENOMINATOR_WITH_BROADCAST_FIELD_NUMBER: _ClassVar[int]
    ENABLE_PRETTY_PRINT_FIELD_NUMBER: _ClassVar[int]
    PRETTY_PRINT_DUMP_DIR_FIELD_NUMBER: _ClassVar[int]
    XLA_PP_KIND_FIELD_NUMBER: _ClassVar[int]
    disable_div_sqrt_rewrite: bool
    disable_maxpooling_optimization: bool
    disable_reduce_truncation_optimization: bool
    disable_select_optimization: bool
    disable_sqrt_plus_epsilon_rewrite: bool
    disallow_mix_types_opts: bool
    enable_optimize_denominator_with_broadcast: bool
    enable_pretty_print: bool
    pretty_print_dump_dir: str
    xla_pp_kind: XLAPrettyPrintKind
    def __init__(
        self,
        enable_pretty_print: bool = ...,
        pretty_print_dump_dir: _Optional[str] = ...,
        xla_pp_kind: _Optional[_Union[XLAPrettyPrintKind, str]] = ...,
        disable_sqrt_plus_epsilon_rewrite: bool = ...,
        disable_div_sqrt_rewrite: bool = ...,
        disable_reduce_truncation_optimization: bool = ...,
        disable_maxpooling_optimization: bool = ...,
        disallow_mix_types_opts: bool = ...,
        disable_select_optimization: bool = ...,
        enable_optimize_denominator_with_broadcast: bool = ...,
    ) -> None: ...

class ExecutableProto(_message.Message):
    __slots__ = ["code", "input_names", "name", "output_names"]
    CODE_FIELD_NUMBER: _ClassVar[int]
    INPUT_NAMES_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    OUTPUT_NAMES_FIELD_NUMBER: _ClassVar[int]
    code: bytes
    input_names: _containers.RepeatedScalarFieldContainer[str]
    name: str
    output_names: _containers.RepeatedScalarFieldContainer[str]
    def __init__(
        self,
        name: _Optional[str] = ...,
        input_names: _Optional[_Iterable[str]] = ...,
        output_names: _Optional[_Iterable[str]] = ...,
        code: _Optional[bytes] = ...,
    ) -> None: ...

class RuntimeConfig(_message.Message):
    __slots__ = [
        "beaver_type",
        "enable_action_trace",
        "enable_hal_profile",
        "enable_lower_accuracy_rsqrt",
        "enable_pphlo_profile",
        "enable_pphlo_trace",
        "enable_runtime_snapshot",
        "enable_type_checker",
        "experimental_disable_mmul_split",
        "experimental_disable_vectorization",
        "experimental_enable_inter_op_par",
        "experimental_enable_intra_op_par",
        "experimental_inter_op_concurrency",
        "field",
        "fxp_div_goldschmidt_iters",
        "fxp_exp_iters",
        "fxp_exp_mode",
        "fxp_fraction_bits",
        "fxp_log_iters",
        "fxp_log_mode",
        "fxp_log_orders",
        "protocol",
        "public_random_seed",
        "share_max_chunk_size",
        "sigmoid_mode",
        "sine_cosine_iters",
        "snapshot_dump_dir",
        "trunc_allow_msb_error",
        "ttp_beaver_config",
    ]

    class BeaverType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []

    class ExpMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []

    class LogMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []

    class SigmoidMode(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
        __slots__ = []
    BEAVER_TYPE_FIELD_NUMBER: _ClassVar[int]
    ENABLE_ACTION_TRACE_FIELD_NUMBER: _ClassVar[int]
    ENABLE_HAL_PROFILE_FIELD_NUMBER: _ClassVar[int]
    ENABLE_LOWER_ACCURACY_RSQRT_FIELD_NUMBER: _ClassVar[int]
    ENABLE_PPHLO_PROFILE_FIELD_NUMBER: _ClassVar[int]
    ENABLE_PPHLO_TRACE_FIELD_NUMBER: _ClassVar[int]
    ENABLE_RUNTIME_SNAPSHOT_FIELD_NUMBER: _ClassVar[int]
    ENABLE_TYPE_CHECKER_FIELD_NUMBER: _ClassVar[int]
    EXPERIMENTAL_DISABLE_MMUL_SPLIT_FIELD_NUMBER: _ClassVar[int]
    EXPERIMENTAL_DISABLE_VECTORIZATION_FIELD_NUMBER: _ClassVar[int]
    EXPERIMENTAL_ENABLE_INTER_OP_PAR_FIELD_NUMBER: _ClassVar[int]
    EXPERIMENTAL_ENABLE_INTRA_OP_PAR_FIELD_NUMBER: _ClassVar[int]
    EXPERIMENTAL_INTER_OP_CONCURRENCY_FIELD_NUMBER: _ClassVar[int]
    EXP_DEFAULT: RuntimeConfig.ExpMode
    EXP_PADE: RuntimeConfig.ExpMode
    EXP_TAYLOR: RuntimeConfig.ExpMode
    FIELD_FIELD_NUMBER: _ClassVar[int]
    FXP_DIV_GOLDSCHMIDT_ITERS_FIELD_NUMBER: _ClassVar[int]
    FXP_EXP_ITERS_FIELD_NUMBER: _ClassVar[int]
    FXP_EXP_MODE_FIELD_NUMBER: _ClassVar[int]
    FXP_FRACTION_BITS_FIELD_NUMBER: _ClassVar[int]
    FXP_LOG_ITERS_FIELD_NUMBER: _ClassVar[int]
    FXP_LOG_MODE_FIELD_NUMBER: _ClassVar[int]
    FXP_LOG_ORDERS_FIELD_NUMBER: _ClassVar[int]
    LOG_DEFAULT: RuntimeConfig.LogMode
    LOG_NEWTON: RuntimeConfig.LogMode
    LOG_PADE: RuntimeConfig.LogMode
    MultiParty: RuntimeConfig.BeaverType
    PROTOCOL_FIELD_NUMBER: _ClassVar[int]
    PUBLIC_RANDOM_SEED_FIELD_NUMBER: _ClassVar[int]
    SHARE_MAX_CHUNK_SIZE_FIELD_NUMBER: _ClassVar[int]
    SIGMOID_DEFAULT: RuntimeConfig.SigmoidMode
    SIGMOID_MM1: RuntimeConfig.SigmoidMode
    SIGMOID_MODE_FIELD_NUMBER: _ClassVar[int]
    SIGMOID_REAL: RuntimeConfig.SigmoidMode
    SIGMOID_SEG3: RuntimeConfig.SigmoidMode
    SINE_COSINE_ITERS_FIELD_NUMBER: _ClassVar[int]
    SNAPSHOT_DUMP_DIR_FIELD_NUMBER: _ClassVar[int]
    TRUNC_ALLOW_MSB_ERROR_FIELD_NUMBER: _ClassVar[int]
    TTP_BEAVER_CONFIG_FIELD_NUMBER: _ClassVar[int]
    TrustedFirstParty: RuntimeConfig.BeaverType
    TrustedThirdParty: RuntimeConfig.BeaverType
    beaver_type: RuntimeConfig.BeaverType
    enable_action_trace: bool
    enable_hal_profile: bool
    enable_lower_accuracy_rsqrt: bool
    enable_pphlo_profile: bool
    enable_pphlo_trace: bool
    enable_runtime_snapshot: bool
    enable_type_checker: bool
    experimental_disable_mmul_split: bool
    experimental_disable_vectorization: bool
    experimental_enable_inter_op_par: bool
    experimental_enable_intra_op_par: bool
    experimental_inter_op_concurrency: int
    field: FieldType
    fxp_div_goldschmidt_iters: int
    fxp_exp_iters: int
    fxp_exp_mode: RuntimeConfig.ExpMode
    fxp_fraction_bits: int
    fxp_log_iters: int
    fxp_log_mode: RuntimeConfig.LogMode
    fxp_log_orders: int
    protocol: ProtocolKind
    public_random_seed: int
    share_max_chunk_size: int
    sigmoid_mode: RuntimeConfig.SigmoidMode
    sine_cosine_iters: int
    snapshot_dump_dir: str
    trunc_allow_msb_error: bool
    ttp_beaver_config: TTPBeaverConfig
    def __init__(
        self,
        protocol: _Optional[_Union[ProtocolKind, str]] = ...,
        field: _Optional[_Union[FieldType, str]] = ...,
        fxp_fraction_bits: _Optional[int] = ...,
        enable_action_trace: bool = ...,
        enable_type_checker: bool = ...,
        enable_pphlo_trace: bool = ...,
        enable_runtime_snapshot: bool = ...,
        snapshot_dump_dir: _Optional[str] = ...,
        enable_pphlo_profile: bool = ...,
        enable_hal_profile: bool = ...,
        public_random_seed: _Optional[int] = ...,
        share_max_chunk_size: _Optional[int] = ...,
        fxp_div_goldschmidt_iters: _Optional[int] = ...,
        fxp_exp_mode: _Optional[_Union[RuntimeConfig.ExpMode, str]] = ...,
        fxp_exp_iters: _Optional[int] = ...,
        fxp_log_mode: _Optional[_Union[RuntimeConfig.LogMode, str]] = ...,
        fxp_log_iters: _Optional[int] = ...,
        fxp_log_orders: _Optional[int] = ...,
        sigmoid_mode: _Optional[_Union[RuntimeConfig.SigmoidMode, str]] = ...,
        enable_lower_accuracy_rsqrt: bool = ...,
        sine_cosine_iters: _Optional[int] = ...,
        beaver_type: _Optional[_Union[RuntimeConfig.BeaverType, str]] = ...,
        ttp_beaver_config: _Optional[_Union[TTPBeaverConfig, _Mapping]] = ...,
        trunc_allow_msb_error: bool = ...,
        experimental_disable_mmul_split: bool = ...,
        experimental_enable_inter_op_par: bool = ...,
        experimental_enable_intra_op_par: bool = ...,
        experimental_disable_vectorization: bool = ...,
        experimental_inter_op_concurrency: _Optional[int] = ...,
    ) -> None: ...

class ShapeProto(_message.Message):
    __slots__ = ["dims"]
    DIMS_FIELD_NUMBER: _ClassVar[int]
    dims: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, dims: _Optional[_Iterable[int]] = ...) -> None: ...

class TTPBeaverConfig(_message.Message):
    __slots__ = ["adjust_rank", "server_host", "session_id"]
    ADJUST_RANK_FIELD_NUMBER: _ClassVar[int]
    SERVER_HOST_FIELD_NUMBER: _ClassVar[int]
    SESSION_ID_FIELD_NUMBER: _ClassVar[int]
    adjust_rank: int
    server_host: str
    session_id: str
    def __init__(
        self,
        server_host: _Optional[str] = ...,
        session_id: _Optional[str] = ...,
        adjust_rank: _Optional[int] = ...,
    ) -> None: ...

class ValueChunkProto(_message.Message):
    __slots__ = ["chunk_offset", "content", "total_bytes"]
    CHUNK_OFFSET_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    TOTAL_BYTES_FIELD_NUMBER: _ClassVar[int]
    chunk_offset: int
    content: bytes
    total_bytes: int
    def __init__(
        self,
        total_bytes: _Optional[int] = ...,
        chunk_offset: _Optional[int] = ...,
        content: _Optional[bytes] = ...,
    ) -> None: ...

class ValueMetaProto(_message.Message):
    __slots__ = ["data_type", "is_complex", "shape", "storage_type", "visibility"]
    DATA_TYPE_FIELD_NUMBER: _ClassVar[int]
    IS_COMPLEX_FIELD_NUMBER: _ClassVar[int]
    SHAPE_FIELD_NUMBER: _ClassVar[int]
    STORAGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    VISIBILITY_FIELD_NUMBER: _ClassVar[int]
    data_type: DataType
    is_complex: bool
    shape: ShapeProto
    storage_type: str
    visibility: Visibility
    def __init__(
        self,
        data_type: _Optional[_Union[DataType, str]] = ...,
        is_complex: bool = ...,
        visibility: _Optional[_Union[Visibility, str]] = ...,
        shape: _Optional[_Union[ShapeProto, _Mapping]] = ...,
        storage_type: _Optional[str] = ...,
    ) -> None: ...

class DataType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class Visibility(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class PtType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class FieldType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class ProtocolKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class SourceIRType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []

class XLAPrettyPrintKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
