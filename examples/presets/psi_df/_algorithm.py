import pandas as pd
from secretflow import PYU, SPU, reveal

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

df1 = pd.DataFrame({"id": [1, 2, 3], "value": [4, 5, 6]})
df1 = devices(PYU, "alice")(lambda x: x)(df1)

df2 = pd.DataFrame({"id": [1, 3, 5], "value": [7, 8, 9]})
df2 = devices(PYU, "bob")(lambda x: x)(df2)

results = devices(SPU, "alice", "bob").psi_df(
    key=["id"],
    dfs=[df1, df2],
    receiver="alice",
)

print(reveal(results))
