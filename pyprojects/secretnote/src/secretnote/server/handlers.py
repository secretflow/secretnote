from itertools import chain
from pathlib import Path, PurePath

from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
)
from tornado import web


class SinglePageApplicationHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    JupyterHandler,
    web.StaticFileHandler,
):
    def try_file(self, path: str) -> PurePath:
        """
        Try to find a file matching `path` in the configured static root, in a way that\
            is compatible with single-page applications.

        :param path: URL path as requested
        :type path: str
        :raises web.HTTPError: if no file can be matched using `path`
        :return: a PurePath that can be passed to
            :ref:`StaticFileHandler.get` or
            :ref:`ExtensionHandlerJinjaMixin.render_template`
        :rtype: PurePath
        """
        uri = Path(path.lstrip("/"))
        root = Path(self.root)
        if (root / uri).is_file():
            # the file exists, so we can just serve it
            return uri
        for index in (dir / "index.html" for dir in chain((uri,), uri.parents)):
            # try to find an index.html file starting from the requested path
            # and going up to the root
            # this allows the index page to be served even if the requested path
            # contains dynamic segments (e.g. handled by react-router)
            if (root / index).is_file():
                return index
        raise web.HTTPError(404)

    @web.authenticated
    async def get(self, path: str, *args, **kwargs):
        file_path = self.try_file(path)

        if file_path.suffix != ".html":
            # serve the file as-is
            return await super().get(str(file_path), *args, **kwargs)

        body = self.render_template(
            str(file_path),
            static_url_prefix=self.static_url_prefix.rstrip("/"),
        )
        self.write(body)

        # TODO: flush will prevent headers from being set further
        # thus headers like `ETag`, set by StaticFileHandler.get,
        # will not be sent
        await self.flush()
