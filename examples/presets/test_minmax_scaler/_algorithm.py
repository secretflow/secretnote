import numpy as np
import pandas as pd
from secretflow import PYU, reveal
from secretflow.data.base import Partition
from secretflow.data.horizontal.dataframe import HDataFrame
from secretflow.data.mix.dataframe import MixDataFrame
from secretflow.data.vertical.dataframe import VDataFrame
from secretflow.preprocessing.scaler import MinMaxScaler
from secretflow.security.aggregation.plain_aggregator import PlainAggregator
from secretflow.security.compare.plain_comparator import PlainComparator
from secretflow.utils.simulation.datasets import load_iris
from sklearn.preprocessing import MinMaxScaler as SkMinMaxScaler

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

alice = devices(PYU, "alice")
bob = devices(PYU, "bob")
carol = devices(PYU, "carol")

hdf = load_iris(
    parts=[alice, bob],
    aggregator=PlainAggregator(alice),
    comparator=PlainComparator(carol),
)
hdf_alice = reveal(hdf.partitions[alice].data)
hdf_bob = reveal(hdf.partitions[bob].data)

vdf_alice = pd.DataFrame(
    {
        "a1": ["K5", "K1", None, "K6"],
        "a2": ["A5", "A1", "A2", "A6"],
        "a3": [5, 1, 2, 6],
    }
)

vdf_bob = pd.DataFrame(
    {
        "b4": [10.2, 20.5, None, -0.4],
        "b5": ["B3", None, "B9", "B4"],
        "b6": [3, 1, 9, 4],
    }
)

vdf = VDataFrame(
    {
        alice: Partition(data=alice(lambda: vdf_alice)()),
        bob: Partition(data=bob(lambda: vdf_bob)()),
    }
)


# GIVEN
df_part0 = pd.DataFrame(
    {
        "a1": ["A1", "B1", None, "D1", None, "B4", "C4", "D4"],
        "a2": ["A2", "B2", "C2", "D2", "A5", "B5", "C5", "D5"],
        "a3": [5, 1, 2, 6, 15, None, 23, 6],
    }
)

df_part1 = pd.DataFrame(
    {
        "b4": [10.2, 20.5, None, -0.4, None, 0.5, None, -10.4],
        "b5": ["B3", None, "B9", "B4", "A3", None, "C9", "E4"],
        "b6": [3, 1, 9, 4, 31, 12, 9, 21],
    }
)
v_part0 = HDataFrame(
    {
        alice: Partition(data=alice(lambda: df_part0.iloc[:4, :])()),
        bob: Partition(data=bob(lambda: df_part0.iloc[4:, :])()),
    },
    aggregator=PlainAggregator(carol),
    comparator=PlainComparator(carol),
)
v_part1 = HDataFrame(
    {
        alice: Partition(data=alice(lambda: df_part1.iloc[:4, :])()),
        bob: Partition(data=bob(lambda: df_part1.iloc[4:, :])()),
    },
    aggregator=PlainAggregator(carol),
    comparator=PlainComparator(carol),
)
v_mix = MixDataFrame(partitions=[v_part0, v_part1])

scaler = MinMaxScaler()

# WHEN
value = scaler.fit_transform(v_mix[["a3", "b4", "b6"]])
params = scaler.get_params()

# THEN
assert params
sk_scaler = SkMinMaxScaler()
expect_alice = sk_scaler.fit_transform(df_part0[["a3"]])
np.testing.assert_equal(
    pd.concat(
        [
            reveal(value.partitions[0].partitions[alice].data),
            reveal(value.partitions[0].partitions[bob].data),
        ]
    ),
    expect_alice,
)
expect_bob = sk_scaler.fit_transform(df_part1[["b4", "b6"]])
np.testing.assert_almost_equal(
    pd.concat(
        [
            reveal(value.partitions[1].partitions[alice].data),
            reveal(value.partitions[1].partitions[bob].data),
        ]
    ),
    expect_bob,
)

scaler = MinMaxScaler()

scaler.fit(vdf["a3"])
