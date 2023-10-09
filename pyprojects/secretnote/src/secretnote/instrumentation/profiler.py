import sys
from contextlib import suppress
from types import FrameType
from typing import Any, Dict, List, Optional, Tuple

from opentelemetry import context, trace

from .models import (
    CallTrace,
    ProfilerRule,
    Reference,
    ReferenceMap,
    SourceLocation,
    Variable,
)


class SourceCodePathFinder:
    def __init__(self):
        self._cache: dict[str, str] = {}

    def find(self, filename: str) -> str:
        if filename in self._cache:
            return self._cache[filename]

        prefixes = sorted(sys.path, key=len, reverse=True)

        for path in prefixes:
            if filename.startswith(path):
                self._cache[filename] = relpath = filename[len(path) + 1 :]
                return relpath

        return filename


class Profiler:
    def __init__(self, rules: List[ProfilerRule], name: str = "root"):
        self.tracer = trace.get_tracer(__name__)
        self.pathfinder = SourceCodePathFinder()

        self.rules = rules
        self.name = name

        self.root_span: trace.Span
        self.context_stack: List[Tuple[context.Context, CallTrace]]
        self.retvals: Dict[Reference, Variable]

    def match_rule(self, frame: FrameType) -> Optional[ProfilerRule]:
        file = self.pathfinder.find(frame.f_code.co_filename)
        for rule in self.rules:
            if not rule.file.match(file):
                continue
            if not rule.func_name.match(frame.f_code.co_name):
                continue
            return rule
        return None

    def create_ref(self, var: Any) -> str:
        return f"0x{id(var):x}"

    def record_call(self, frame: FrameType) -> CallTrace:
        file = self.pathfinder.find(frame.f_code.co_filename)

        location = SourceLocation(
            file=file,
            line=frame.f_code.co_firstlineno,
        )

        values = {**frame.f_globals, **frame.f_locals}

        boundvars: ReferenceMap = {}

        for name in frame.f_code.co_varnames:
            if name not in values:  # unbound variable
                continue
            var = Variable(name=name, snapshot=str(values[name]))
            boundvars[self.create_ref(values[name])] = var

        freevars: ReferenceMap = {}

        for name in frame.f_code.co_freevars:
            if name not in values:  # unbound variable
                continue
            var = Variable(name=name, snapshot=str(values[name]))
            freevars[self.create_ref(values[name])] = var

        return CallTrace(
            call=location,
            boundvars=boundvars,
            freevars=freevars,
            retval="None",
        )

    def __call__(self, frame: FrameType, event: str, arg: Any):
        if not (rule := self.match_rule(frame)):
            return

        self.pathfinder.find(frame.f_code.co_filename)
        funcname = frame.f_code.co_name

        curr_ctx, curr_call = self.context_stack[-1]

        if event == "call":
            span = self.tracer.start_span(funcname, curr_ctx)
            call = self.record_call(frame)
            if rule.semantics:
                with suppress(Exception):
                    call.semantics = rule.semantics(frame)
            ctx = trace.set_span_in_context(span, curr_ctx)
            self.context_stack.append((ctx, call))
            return

        if event == "return":
            span = trace.get_current_span(curr_ctx)
            span.set_attribute("secretnote.tracing.call", curr_call.json())
            span.set_attribute(
                "secretnote.tracing.call.semantics",
                curr_call.semantics is not None,
            )
            span.end()
            self.context_stack.pop()
            return

    def start(self):
        self.root_span = self.tracer.start_span(self.name)
        ctx = trace.set_span_in_context(self.root_span)
        _ = self.record_call(sys._getframe())
        self.context_stack = [(ctx, _)]
        self.retvals = {}
        sys.setprofile(self)

    def stop(self):
        sys.setprofile(None)
        self.root_span.end()
        del self.root_span
        del self.context_stack
        del self.retvals

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()
        return False
