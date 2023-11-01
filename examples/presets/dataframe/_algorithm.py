import numpy as np
import pandas as pd
from secretflow import PYU
from secretflow.data.base import Partition
from secretflow.data.horizontal.dataframe import HDataFrame

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

alice = devices(PYU, "alice")
bob = devices(PYU, "bob")

part1 = pd.DataFrame(np.random.rand(10, 4), columns=["a", "b", "c", "d"])
part2 = pd.DataFrame(np.random.rand(10, 4), columns=["a", "b", "c", "d"])

df = HDataFrame(
    {
        alice: Partition(alice(lambda x: x)(part1)),
        bob: Partition(bob(lambda x: x)(part2)),
    }
)

print(df.dtypes)
