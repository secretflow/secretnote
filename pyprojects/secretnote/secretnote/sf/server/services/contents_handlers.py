# Handlers for contents APIs. Simply forward all requests to the Jupyter Server
# running on the host to manage notebook files locally.

from tornado.httputil import HTTPServerRequest
from jupyter_server.utils import ensure_async
from ._proxy_handler import ProxyHandler


def get_request_source(request: HTTPServerRequest):
    """Get the hostname and port from the request. Defaults to localhost:80."""
    hostname, port = request.headers["Host"].split(":")
    hostname, port = hostname or "localhost", port or 80

    return hostname, port


class ContentsAPIProxyHandler(ProxyHandler):
    """Proxy contents API requests to the Jupyter Server running on the host."""

    def rewrite(self, path: str):
        return "/api/contents" + path


class FileDownloadHandler(ProxyHandler):
    """Handler for notebook file download (export)."""

    def rewrite(self, path: str):
        return "/files/" + path

    def get(self, path: str):
        self.set_header("Content-Disposition", f"attachment;filename={path}")

        return self.proxy(path)


contents_handlers = [
    (
        r"/secretnote/api/contents(.*)",
        ContentsAPIProxyHandler,
        {
            "host_allowlist": lambda *_: True,
        },
    ),
    (
        r"/secretnote/files/(.*)",
        FileDownloadHandler,
    ),
]
