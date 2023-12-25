import ast

from IPython.core.display import HTML
from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, line_magic, magics_class
from IPython.display import DisplayHandle

from .display.app import visualize
from .sdk import create_profiler


def load_ipython_extension(ipython: InteractiveShell):
    enabled = False

    @magics_class
    class AutoprofileMagics(Magics):
        @line_magic
        def autoprofile(self, line):
            nonlocal enabled
            if line == "on":
                enabled = True
                print("Auto-profiling enabled")
            else:
                enabled = False
                print("Auto-profiling disabled")

    class OnePlusOneInjector(ast.NodeTransformer):
        def visit_Module(self, node):
            if not enabled:
                return node

            if not node.body:
                return node

            indented = [*node.body]

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
            ]
            return node

    def create_display():
        handle = DisplayHandle()
        handle.display(HTML("<p>Profiling ...</p>"))
        return handle

    def update_display(handle, data):
        handle.update(data)

    ipython.push(
        {
            "__create_profiler__": create_profiler,
            "__visualize_profile__": visualize,
            "__create_display__": create_display,
            "__update_display__": update_display,
        }
    )
    ipython.register_magics(AutoprofileMagics)
    ipython.ast_transformers.append(OnePlusOneInjector())
