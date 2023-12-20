from __future__ import annotations

from typing import List, Literal, Optional, Union

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
from secretnote.utils.pydantic import update_forward_refs
from secretnote.utils.warnings import optional_dependencies

with optional_dependencies("secretflow"):
    from secretflow.data.vertical import VDataFrame


class Constant(BaseModel):
    kind: Literal["constant"] = "constant"
    value: Union[int, float, str]


class ColumnRef(BaseModel):
    kind: Literal["column_ref"] = "column_ref"
    name: str


ValueExpression = Annotated[
    Union[Constant, ColumnRef],
    Field(discriminator="kind"),
]


class Conjunction(BaseModel):
    kind: Literal["AND"] = "AND"
    rhs: Condition


class Disjunction(BaseModel):
    kind: Literal["OR"] = "OR"
    rhs: Condition


class Condition(BaseModel):
    lhs: ColumnRef
    op: Literal["==", "!=", "<", "<=", ">", ">="]
    rhs: ValueExpression

    junction: Optional[Union[Conjunction, Disjunction]] = None


class Case(BaseModel):
    when: Condition
    then: ValueExpression


class MapCases(Task):
    cases: List[Case]

    default_value: Optional[ValueExpression] = None
    output_column: Optional[str] = None

    table_in: IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None]

    @Task.output(IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None])
    def table_out(self):
        ...


update_forward_refs(globals())
