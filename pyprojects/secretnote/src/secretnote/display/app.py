from secretnote.instrumentation.profiler import Profiler

from .core.renderer import render
from .models import Visualization
from .parsers.timeline import TimelineParser


def visualize_run(profiler: Profiler):
    timeline = TimelineParser()
    for span in profiler.exporter.iter_spans():
        timeline.feed(span)
    timeline.digest()
    return render(Visualization(timeline=timeline.export()))
