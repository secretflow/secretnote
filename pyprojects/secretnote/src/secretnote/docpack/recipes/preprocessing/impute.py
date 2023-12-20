from typing import List, Literal, Union

from pydantic import BaseModel, Field
from typing_extensions import Annotated

from secretnote.docpack.hazmat.primitives import (
    ALICE,
    AXIS_COLUMNS,
    BOB,
    IO,
    Partitioned,
    Task,
)
from secretnote.utils.warnings import optional_dependencies

with optional_dependencies("secretflow"):
    from secretflow.data.vertical import VDataFrame


class FillMean(BaseModel):
    strategy: Literal["mean"] = "mean"


class FillMedian(BaseModel):
    strategy: Literal["median"] = "median"


class FillMostFrequent(BaseModel):
    strategy: Literal["most_frequent"] = "most_frequent"


class FillConstant(BaseModel):
    strategy: Literal["constant"] = "constant"
    fill_value: Union[str, int, float]


class GeneralMissingValue(BaseModel):
    kind: Literal["general_na"] = "general_na"


class StringMissingValue(BaseModel):
    kind: Literal["string"] = "string"
    value: str


class IntegerMissingValue(BaseModel):
    kind: Literal["integer"] = "integer"
    value: int


class FloatMissingValue(BaseModel):
    kind: Literal["float"] = "float"
    value: float


MissingValue = Annotated[
    Union[
        GeneralMissingValue,
        StringMissingValue,
        IntegerMissingValue,
        FloatMissingValue,
    ],
    Field(discriminator="kind"),
]

FillStrategy = Annotated[
    Union[FillMean, FillMedian, FillMostFrequent, FillConstant],
    Field(discriminator="strategy"),
]


class Features(BaseModel):
    """Features to fill."""

    columns: List[str]


class Impute(Task):
    missing_value: MissingValue = GeneralMissingValue()
    fill_strategy: FillStrategy = FillMean()

    table_in: IO[
        VDataFrame,
        Partitioned[Union[ALICE, BOB], AXIS_COLUMNS],
        Features,
    ]

    @Task.output(IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None])
    def output_table(self):
        ...
