from typing import Dict, List, Tuple, Type

from jupyter_server.base.handlers import FileFindHandler, JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
)
from tornado import web

from secretnote._resources import require


def static_paths():
    package = require.package_of("@secretflow/secretnote/index.html")
    return [package.path.joinpath("dist")]


class SinglePageApplicationHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    FileFindHandler,
):
    @web.authenticated
    async def get(self, path: str = "/"):
        """Serve static content, emulating a typical single-page application.

        - Try to match path against a static file. If it exists, serve it
        - Otherwise, serve the index.html file, which will load the application
          and handle the routing.
        """
        path = path.lstrip("/")
        try:
            await super().get(path)
        except web.HTTPError:
            self.clear()
            self.write(self.render_template("index.html"))


single_page_static_path = static_paths()

pages_handlers: List[Tuple[str, Type[JupyterHandler], Dict]] = [
    (
        r"/secretnote(.*)",
        SinglePageApplicationHandler,
        {"path": single_page_static_path},
    ),
]
