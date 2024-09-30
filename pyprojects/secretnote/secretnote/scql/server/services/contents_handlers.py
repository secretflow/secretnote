# Handlers for contents APIs. Simply forward all requests to the Jupyter Server
# running on the host to manage notebook files locally.

from ._proxy_handler import ProxyHandler


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
        r"/secretnoteagent/api/contents(.*)",
        ContentsAPIProxyHandler,
        {
            "host_allowlist": lambda *_: True,
        },
    ),
    (
        r"/secretnoteagent/files/(.*)",
        FileDownloadHandler,
    ),
]
