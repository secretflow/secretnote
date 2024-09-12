# Generic proxy handler

from tornado.httputil import HTTPServerRequest
from jupyter_server.utils import ensure_async
from jupyter_server_proxy.handlers import ProxyHandler as _ProxyHandler


def get_request_source(request: HTTPServerRequest):
    """Get the hostname and port from the request. Defaults to localhost:80."""
    hostname, port = request.headers["Host"].split(":")
    hostname, port = hostname or "localhost", port or 80

    return hostname, port


class ProxyHandler(_ProxyHandler):
    """Proxy requests to the server running on the host."""

    def rewrite(self, path: str):
        return path  # no rewrite by default

    def proxy(self, proxied_path: str):
        hostname, port = get_request_source(self.request)

        return super().proxy(hostname, port, self.rewrite(proxied_path))

    async def http_get(self, proxied_path: str):
        return await ensure_async(self.proxy(proxied_path))

    def post(self, proxied_path: str):
        return self.proxy(proxied_path)

    def put(self, proxied_path: str):
        return self.proxy(proxied_path)

    def delete(self, proxied_path: str):
        return self.proxy(proxied_path)

    def head(self, proxied_path: str):
        return self.proxy(proxied_path)

    def patch(self, proxied_path: str):
        return self.proxy(proxied_path)

    def options(self, proxied_path: str):
        return self.proxy(proxied_path)
