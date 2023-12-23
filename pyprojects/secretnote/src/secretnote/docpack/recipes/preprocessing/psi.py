from enum import Enum
from typing import Literal, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.docpack.hazmat.primitives import (
    ALICE,
    AXIS_COLUMNS,
    BOB,
    IO,
    Exclusive,
    Partitioned,
    Task,
)
from secretnote.utils.warnings import peer_dependencies

with peer_dependencies("secretflow"):
    import pandas as pd
    from secretflow.data.vertical import VDataFrame


class ECDHProtocol(BaseModel):
    class CurveType(Enum):
        CURVE_FOURQ = "CURVE_FOURQ"
        CURVE_25519 = "CURVE_25519"
        CURVE_SM2 = "CURVE_SM2"
        CURVE_SECP256K1 = "CURVE_SECP256K1"

    kind: Literal["ECDH"] = "ECDH"
    curve_type: CurveType = CurveType.CURVE_FOURQ


class KKRTProtocol(BaseModel):
    kind: Literal["KKRT"] = "KKRT"


class BC22Protocol(BaseModel):
    kind: Literal["BC22"] = "BC22"


PSIProtocol = Annotated[
    Union[ECDHProtocol, KKRTProtocol, BC22Protocol],
    Field(discriminator="kind"),
]


class JoinOn(BaseModel):
    column: str


class PSI(Task):
    table_0: IO[pd.DataFrame, Exclusive[ALICE], JoinOn]
    table_1: IO[pd.DataFrame, Exclusive[BOB], JoinOn]

    protocol: PSIProtocol = ECDHProtocol()
    bucket_size: int = 2**20
    sort_results: bool = True

    @Task.output(IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None])
    def intersection(self):
        ...
