import os

from secretnote.formal.locations import (
    SFConfigSimulation,
    SymbolicPYU,
    SymbolicWorld,
)

# Symbols

sym_world = SymbolicWorld(world=frozenset(("alice", "bob", "carol")))
sym_alice = SymbolicPYU("alice")
sym_bob = SymbolicPYU("bob")
sym_carol = SymbolicPYU("carol")


# Bindings

SELF_PARTY = os.environ.get("SELF_PARTY", "sim")


if SELF_PARTY == "sim":
    sym_world.reify(SFConfigSimulation())

else:
    raise NotImplementedError


alice = sym_alice.reify()
bob = sym_bob.reify()
carol = sym_carol.reify()
