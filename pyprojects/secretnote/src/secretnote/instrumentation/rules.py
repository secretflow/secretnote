from typing import Any

from .checkpoint import DEFAULT_CHECKPOINTS, APILevel, LocalCallable

MOCK: Any = ...


def create_default_rules():
    import fed
    import fed._private.fed_call_holder
    import ray
    import ray.actor
    import ray.remote_function
    import secretflow
    import secretflow.distributed
    import secretflow.preprocessing.binning.vert_woe_binning
    import secretflow.preprocessing.binning.vert_woe_substitution
    import secretflow.stats
    from secretflow.device.proxy import _actor_wrapper

    add = DEFAULT_CHECKPOINTS.add_function

    for fn in (
        ray.remote_function.RemoteFunction._remote,
        ray.actor.ActorClass._remote,
        ray.actor.ActorMethod._remote,
        ray.get,
        fed.send,
        fed.recv,
        fed._private.fed_call_holder.FedCallHolder.internal_remote,
        secretflow.SPU.infeed_shares,
        secretflow.SPU.outfeed_shares,
        secretflow.PYU.__call__,
        secretflow.SPU.__call__,
        _actor_wrapper,
    ):
        add(fn, api_level=APILevel.IMPLEMENTATION)

    for fn in (
        LocalCallable(fn=secretflow.PYU.__call__, load_const=(1,)),
        LocalCallable(fn=secretflow.SPU.__call__, load_const=(1,)),
        LocalCallable(fn=_actor_wrapper, load_const=(1,)),
        secretflow.device.kernels.pyu.pyu_to_pyu,
        secretflow.device.kernels.pyu.pyu_to_spu,
        secretflow.device.kernels.pyu.pyu_to_heu,
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
        secretflow.preprocessing.binning.vert_woe_binning.VertWoeBinning.binning,
        secretflow.preprocessing.binning.vert_woe_substitution.VertWOESubstitution.substitution,
    ):
        add(fn, api_level=APILevel.USERLAND)
