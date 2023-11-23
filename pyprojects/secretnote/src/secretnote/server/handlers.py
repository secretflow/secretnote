import tornado
from jupyter_server.base.handlers import FileFindHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
)
from tornado import web


class SinglePageApplicationHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    FileFindHandler,
):
    @tornado.web.authenticated
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
