from secretnote.instrumentation.profiler import Profiler

from .core.renderer import render
from .graph import parse_graph
from .models import Visualization
from .timeline import parse_timeline


def visualize_run(profiler: Profiler):
    timeline = parse_timeline(profiler)
    graph = parse_graph(profiler)
    visualization = Visualization(timeline=timeline, graph=graph)
    render(visualization)
