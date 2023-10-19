from .checkpoint import DEFAULT_CHECKPOINTS, APILevel
from .types import LocalCallable


def create_default_rules():
    import fed
    import fed._private.fed_call_holder
    import ray
    import secretflow
    import secretflow.distributed
    import secretflow.stats.biclassification_eval

    add = DEFAULT_CHECKPOINTS.add_function

    for fn in (
        ray.get,
        fed.send,
        fed.recv,
        fed._private.fed_call_holder.FedCallHolder.internal_remote,
    ):
        add(fn, api_level=APILevel.IMPLEMENTATION)

    for fn in (
        secretflow.PYU.__call__,
        secretflow.SPU.__call__,
        LocalCallable(fn=secretflow.PYU.__call__, load_const=(1,)),
        LocalCallable(fn=secretflow.SPU.__call__, load_const=(1,)),
        secretflow.SPU.infeed_shares,
        secretflow.SPU.outfeed_shares,
        secretflow.device.kernels.pyu.pyu_to_pyu,
        secretflow.device.kernels.pyu.pyu_to_spu,
        secretflow.device.kernels.pyu.pyu_to_heu,
        secretflow.device.kernels.pyu.pyu_to_teeu,
        secretflow.device.kernels.spu.spu_to_pyu,
        secretflow.device.kernels.spu.spu_to_spu,
        secretflow.device.kernels.spu.spu_to_heu,
        secretflow.device.kernels.heu.heu_to_pyu,
        secretflow.device.kernels.heu.heu_to_spu,
        secretflow.device.kernels.heu.heu_to_heu,
        secretflow.reveal,
    ):
        add(fn, api_level=APILevel.INVARIANT)

    for fn in (
        secretflow.data.horizontal.HDataFrame.shape.fget,
        secretflow.data.vertical.VDataFrame.shape.fget,
        secretflow.data.ndarray.FedNdarray.shape.fget,
    ):
        add(fn, api_level=APILevel.USERLAND)
