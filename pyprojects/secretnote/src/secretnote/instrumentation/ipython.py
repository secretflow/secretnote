import ast

from IPython.core.display import HTML
from IPython.core.getipython import get_ipython
from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, line_magic, magics_class
from IPython.display import DisplayHandle

from .display.app import visualize
from .display.models import VisualizationProps
from .sdk import create_profiler


@magics_class
class AutoProfilerController(Magics):
    def __init__(self, shell=None, **kwargs):
        super().__init__(shell, **kwargs)
        self.enabled = False

    @line_magic
    def autoprofile(self, line):
        self.enabled = line == "on"
        if self.enabled:
            print("Auto-profiling enabled")
        else:
            print("Auto-profiling disabled")

    def create_display(self):
        handle = DisplayHandle()
        handle.display(HTML("<p>Profiling ...</p>"))
        return handle

    def update_display(self, handle: DisplayHandle, data: VisualizationProps):
        if not data.dependencies.nodes:
            handle.update(HTML("<span></span>"))
            return
        handle.update(data)


class AutoProfilerInjector(ast.NodeTransformer):
    def __init__(self, controller: AutoProfilerController) -> None:
        self.controller = controller

    def visit_Module(self, node):
        if not self.controller.enabled:
            return node

        if not node.body:
            return node

        ipython = get_ipython()
        if not ipython:
            return node

        last_line = node.body[-1]
        if isinstance(last_line, ast.Expr):
            indented = [
                *node.body[:-1],
                ast.Assign(
                    targets=[ast.Name(id="__last_expr__", ctx=ast.Store())],
                    value=last_line.value,
                ),
            ]
            expr_eval = [ast.Expr(value=ast.Name(id="__last_expr__", ctx=ast.Load()))]
        else:
            indented = node.body[:]
            expr_eval = []

        profiler_name = f"__profiler_c{ipython.history_length}__"
        handle_name = f"__handle_c{ipython.history_length}__"

        # with __create_profiler__() as __profiler_c1__: ...

        with_body = ast.With(
            items=[
                ast.withitem(
                    context_expr=ast.Call(
                        func=ast.Name(id="__create_profiler__", ctx=ast.Load()),
                        args=[],
                        keywords=[],
                    ),
                    optional_vars=ast.Name(id=profiler_name, ctx=ast.Store()),
                )
            ],
            body=[*indented, ast.Pass()],
        )

        # display(__visualize_profile__(__profiler_c1__))

        create_display_assign = ast.Assign(
            targets=[
                ast.Name(id=handle_name, ctx=ast.Store()),
            ],
            value=ast.Call(
                func=ast.Name(id="__create_display__", ctx=ast.Load()),
                args=[],
                keywords=[],
            ),
        )

        update_display = ast.Expr(
            value=ast.Call(
                func=ast.Name(id="__update_display__", ctx=ast.Load()),
                args=[
                    ast.Name(id=handle_name, ctx=ast.Load()),
                    ast.Call(
                        func=ast.Name(id="__visualize_profile__", ctx=ast.Load()),
                        args=[ast.Name(id=profiler_name, ctx=ast.Load())],
                        keywords=[],
                    ),
                ],
                keywords=[],
            )
        )

        node.body = [
            create_display_assign,
            with_body,
            update_display,
            *expr_eval,
        ]
        return node


def load_ipython_extension(ipython: InteractiveShell):
    controller = AutoProfilerController(ipython)
    transformer = AutoProfilerInjector(controller)

    ipython.push(
        {
            "__create_profiler__": create_profiler,
            "__visualize_profile__": visualize,
            "__create_display__": controller.create_display,
            "__update_display__": controller.update_display,
        }
    )

    ipython.register_magics(controller)
    ipython.ast_transformers.append(transformer)


def unload_ipython_extension(ipython: InteractiveShell):
    ipython.ast_transformers = [
        t for t in ipython.ast_transformers if not isinstance(t, AutoProfilerInjector)
    ]
    if ipython.magics_manager:
        ipython.magics_manager.magics["line"].pop("autoprofile", None)
