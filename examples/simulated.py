import jax.numpy as jnp
import secretflow
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

import secretnote.formal.operations as sfx
from secretnote.compat.secretflow.device.driver import SFConfigSimulationFullyManaged
from secretnote.compat.spu import (
    SPUClusterDef,
    SPUConfig,
    SPUFieldType,
    SPUNode,
    SPUProtocolKind,
    SPURuntimeConfig,
)
from secretnote.instrumentation import MermaidExporter, ProfilingInstrumentor

secretflow_config = SFConfigSimulationFullyManaged(parties=["alice", "bob"])


secretflow.shutdown()
secretflow.init(**secretflow_config.dict())

alice = secretflow.PYU("alice")
bob = secretflow.PYU("bob")


spu_config = SPUConfig(
    cluster_def=SPUClusterDef(
        nodes=[
            SPUNode(party="alice", address="localhost:32767"),
            SPUNode(party="bob", address="localhost:32768"),
        ],
        runtime_config=SPURuntimeConfig(
            protocol=SPUProtocolKind.SEMI2K,
            field=SPUFieldType.FM128,
        ),
    ),
)

spu = secretflow.SPU(**spu_config.dict())


mermaid = MermaidExporter()

resource = Resource(attributes={SERVICE_NAME: "simulation"})
provider = TracerProvider(resource=resource)
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="localhost:4317", insecure=True)),
)
provider.add_span_processor(
    BatchSpanProcessor(mermaid),
)
trace.set_tracer_provider(provider)


def dot(x, y):
    return jnp.dot(x, y)


if __name__ == "__main__":
    with ProfilingInstrumentor():
        x = sfx.use_cleartext(alice)(jnp.asarray([1, 2, 3]))
        y = sfx.use_cleartext(bob)(jnp.asarray([1, 2, 3]))
        z = sfx.use_relocation(spu, x)()
        w = sfx.use_relocation(spu, y)()
        r = sfx.use_function(spu, z, w)(dot)
        s = sfx.use_relocation(alice, r)()
        secretflow.reveal(s)
