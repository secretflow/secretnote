from pathlib import Path
from typing import Any

from pydantic import BaseModel

from secretnote.utils.warnings import peer_dependencies

with peer_dependencies("secretflow"):
    import pandas as pd
    from secretflow.data.vertical import VDataFrame


from .primitives import AXIS_COLUMNS, IO, Exclusive, Partitioned


class DataFrameFileIO(IO[pd.DataFrame, Exclusive[Any], Any], BaseModel):
    """Load a DataFrame from a file supported by Pandas."""

    path: Path


class VerticalDataFrameFileIO(
    IO[VDataFrame, Partitioned[Any, AXIS_COLUMNS], Any],
    BaseModel,
):
    """Load a vertically-partitioned DataFrame from two parties."""

    path_0: Path
    path_1: Path
