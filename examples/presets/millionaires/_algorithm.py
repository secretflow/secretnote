"""Yao's Millionaires' Problem in SecretFlow"""


import jax
import secretflow
from secretflow import PYU, SPU

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

key = jax.random.PRNGKey(42)


def balance(key: jax.random.KeyArray, random_iter: int) -> jax.Array:
    for _ in range(random_iter):
        key, subkey = jax.random.split(key)
    return jax.random.randint(key, shape=(), minval=10**6, maxval=10**9)


def compare(x: jax.Array, y: jax.Array) -> jax.Array:
    return x > y


balance_alice = devices(PYU, "alice")(balance)(key, 3)
balance_bob = devices(PYU, "bob")(balance)(key, 2)

balance_alice = balance_alice.to(devices(SPU, "alice", "bob"))
balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))

alice_is_richer = devices(SPU, "alice", "bob")(compare)(balance_alice, balance_bob)
alice_is_richer = alice_is_richer.to(devices(PYU, "alice"))

alice_is_richer = secretflow.reveal(alice_is_richer)
print(f"{alice_is_richer=}")

results = {}
results["alice"], results["bob"] = secretflow.reveal((balance_alice, balance_bob))

print(f"{balance_alice=}")
print(f"{balance_bob=}")
