# Serves the static files of the SecretNote frontend as a single-page application.

import os
from tornado import web
from typing import Dict, List, Tuple, Type
from jupyter_server.base.handlers import FileFindHandler, JupyterHandler
from jupyter_server.extension.handler import ExtensionHandlerMixin

__dirname__ = os.path.dirname(__file__)


class SinglePageApplicationHandler(
    FileFindHandler,
    ExtensionHandlerMixin,
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


single_page_static_path = os.path.join(__dirname__, "../../static/index.html")

pages_handlers: List[Tuple[str, Type[JupyterHandler], Dict]] = [
    (
        r"/secretnote(.*)",
        SinglePageApplicationHandler,
        {"path": single_page_static_path},
    ),
]