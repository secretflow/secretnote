from typing import Union

from secretnote.docpack.hazmat.primitives import (
    ALICE,
    AXIS_COLUMNS,
    BOB,
    IO,
    Partitioned,
    Task,
)
from secretnote.utils.warnings import peer_dependencies

with peer_dependencies("secretflow"):
    from secretflow.data.vertical import VDataFrame


class TrainTestSplit(Task):
    table: IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None]

    test_size: float = 0.25
    random_state: int = 42
    shuffle: bool = True

    @Task.output(IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None])
    def train(self):
        ...

    @Task.output(IO[VDataFrame, Partitioned[Union[ALICE, BOB], AXIS_COLUMNS], None])
    def test(self):
        ...
