import os

from secretnote.formal.locations import (
    PortBinding,
    SFConfigNetworked,
    SFConfigSimulation,
    SymbolicPYU,
    SymbolicWorld,
)

# Symbols

sym_world = SymbolicWorld(world=frozenset(("alice", "bob")))
sym_alice = SymbolicPYU("alice")
sym_bob = SymbolicPYU("bob")

# Bindings

SELF_PARTY = os.environ.get("SELF_PARTY", "sim")


if SELF_PARTY == "sim":
    sym_world.reify(SFConfigSimulation())

else:
    RAY_ADDRESS = os.environ.get("RAY_ADDRESS")
    assert RAY_ADDRESS

    sym_world.reify(
        SFConfigNetworked(
            self_party=SELF_PARTY,
            ray_address=RAY_ADDRESS,
            network=dict(
                alice=PortBinding(announced_as="127.0.0.1:8080"),
                bob=PortBinding(announced_as="127.0.0.1:8081"),
            ),
        )
    )

alice = sym_alice.reify()
bob = sym_bob.reify()
