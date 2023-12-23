from typing import List, Union

from pydantic import BaseModel

from secretnote.docpack.hazmat.primitives import (
    ALICE,
    AXIS_COLUMNS,
    BOB,
    IO,
    Partitioned,
    Public,
    Task,
)
from secretnote.utils.warnings import peer_dependencies

with peer_dependencies("secretflow"):
    import pandas as pd
    from secretflow.data.vertical import VDataFrame


class Features(BaseModel):
    """Features to compute Pearson correlation."""

    columns: List[str]


class PearsonR(Task):
    table: IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], Features]

    @Task.output(IO[pd.DataFrame, Public, None])
    def result(self):
        ...
