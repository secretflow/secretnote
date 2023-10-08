import os

# Save to temporary files.
import tempfile

import pandas as pd
import secretflow as sf
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from secretflow.data.horizontal import read_csv as h_read_csv
from secretflow.data.vertical import read_csv as v_read_csv
from secretflow.security.aggregation import SecureAggregator
from secretflow.security.compare import SPUComparator
from sklearn.datasets import load_iris

from secretnote.instrumentation import MermaidExporter, ProfilingInstrumentor

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

instrumentor = ProfilingInstrumentor()
instrumentor.start()


sf.shutdown()
sf.init(["alice", "bob", "carol"], address="local")
alice, bob, carol = sf.PYU("alice"), sf.PYU("bob"), sf.PYU("carol")


iris = load_iris(as_frame=True)
data = pd.concat([iris.data, iris.target], axis=1)

# Horizontal partitioning.
h_alice, h_bob, h_carol = data.iloc[:40, :], data.iloc[40:100, :], data.iloc[100:, :]


temp_dir = tempfile.mkdtemp()

h_alice_path = os.path.join(temp_dir, "h_alice.csv")
h_bob_path = os.path.join(temp_dir, "h_bob.csv")
h_carol_path = os.path.join(temp_dir, "h_carol.csv")
h_alice.to_csv(h_alice_path, index=False)
h_bob.to_csv(h_bob_path, index=False)
h_carol.to_csv(h_carol_path, index=False)

# Vertical partitioning.
v_alice, v_bob, v_carol = data.iloc[:, :2], data.iloc[:, 2:4], data.iloc[:, 4:]

# Save to temporary files.
v_alice_path = os.path.join(temp_dir, "v_alice.csv")
v_bob_path = os.path.join(temp_dir, "v_bob.csv")
v_carol_path = os.path.join(temp_dir, "v_carol.csv")
v_alice.to_csv(v_alice_path, index=False)
v_bob.to_csv(v_bob_path, index=False)
v_carol.to_csv(v_carol_path, index=False)

# The aggregator and comparator are respectively used to aggregate
# or compare data in subsequent data analysis operations.
aggr = SecureAggregator(device=alice, participants=[alice, bob, carol])

spu = sf.SPU(sf.utils.testing.cluster_def(parties=["alice", "bob", "carol"]))
comp = SPUComparator(spu)
hdf = h_read_csv(
    {alice: h_alice_path, bob: h_bob_path, carol: h_carol_path},
    aggregator=aggr,
    comparator=comp,
)

vdf = v_read_csv({alice: v_alice_path, bob: v_bob_path, carol: v_carol_path})

print("Horizontal df:\n", hdf.min())
print("\nVertical df:\n", vdf.min())
print("\nPandas:\n", data.min())
