# Serves the static files of the SecretNote frontend as a single-page application.

from os import path
from tornado import web
from typing import Dict, List, Tuple, Type
from jupyter_server.base.handlers import JupyterHandler, FileFindHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerMixin,
    ExtensionHandlerJinjaMixin,
)

single_page_static_path = path.abspath(path.join(path.dirname(__file__), "../../www"))


class SinglePageApplicationHandler(
    ExtensionHandlerMixin,
    ExtensionHandlerJinjaMixin,
    FileFindHandler,
):
    @web.authenticated
    async def get(self, path: str = "/"):
        """Serve static content, emulating a typical single-page application.
        It tries to match path against a static file. If it exists, serve it
        Otherwise, serve the index.html file, which will load the application
        and handle the routing.
        """
        path = path.lstrip("/")
        try:
            await super().get(path)
        except web.HTTPError:
            self.clear()
            self.write(self.render_template("index.html"))


class ThisIsComputeNodeHintPageHandler(
    ExtensionHandlerMixin,
    ExtensionHandlerJinjaMixin,
    FileFindHandler,
):
    @web.authenticated
    async def get(self, *_):
        """This handler is only activated when `--_as-compute-node` flag is set,
        so as to hint the user is visiting the wrong SecretNote page holding
        by the compute node instead of the SecretNote installed locally.
        """
        self.clear()
        self.write(self.render_template("this-is-compute-node.html"))


pages_handlers: List[Tuple[str, Type[JupyterHandler], Dict]] = [
    (
        "/secretnote/(.*)",
        SinglePageApplicationHandler,
        {"path": single_page_static_path},
    ),
]

compute_node_pages_handlers: List[Tuple[str, Type[JupyterHandler], Dict]] = [
    (
        "/secretnote/(.*)",
        ThisIsComputeNodeHintPageHandler,
        {},
    ),
]
