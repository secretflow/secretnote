import numpy as np
import secretflow.data.ndarray
from secretflow import PYU

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

a1 = np.random.random((3, 5))
a2 = np.random.random((3, 5))
arr = secretflow.data.ndarray.load(
    {
        devices(PYU, "alice"): lambda: a1,
        devices(PYU, "bob"): lambda: a2,
    },
    secretflow.data.ndarray.PartitionWay.HORIZONTAL,
)
print(arr.shape)
