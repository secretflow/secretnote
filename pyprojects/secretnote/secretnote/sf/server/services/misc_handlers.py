# Handlers for those uncategoryzed APIs.

from typing import List, Tuple, Type
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web
from ..utils import get_default_kernelspecs


class KernelSpecsHandler(APIHandler):
    @web.authenticated
    def get(self):
        self.finish(get_default_kernelspecs())


class EmptyJSONHandler(APIHandler):
    @web.authenticated
    def get(self, *_):
        self.finish(r"{}")


misc_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    ("/secretnote/api/kernelspecs", KernelSpecsHandler),
    ("/secretnote/api/kernels", EmptyJSONHandler),
    # we don't know the resources and versions of nodes when running locally
    ("/secretnote/api/resources-versions", EmptyJSONHandler),
    ("/secretnote/libro/api/workspace", EmptyJSONHandler),
    ("/secretnote/lsp/status", EmptyJSONHandler),
    ("/secretnote/(.*?)/libro/api/workspace", EmptyJSONHandler),
]
