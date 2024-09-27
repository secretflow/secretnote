# Handlers for the agent that proxies requests to the node's Jupyter Server.

from typing import Dict, List, Tuple, Type
from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.utils import ensure_async
from jupyter_server_proxy.handlers import ProxyHandler


class AgentHandler(ProxyHandler):
    def get_host_and_port(self, server_id: str):
        """Get the host and port of a server according to server id."""
        assert server_id == "0"
        server_info = self.serverapp.server_info()  # type: ignore
        host_name = server_info.get("hostname", "localhost")
        port = server_info.get("port", 8888)

        return host_name, port

    def proxy(self, server_id: str, proxied_path: str):
        """Proxy a HTTP request to a server."""
        host, port = self.get_host_and_port(server_id)
        return super().proxy(host, port, proxied_path)

    async def open(self, server_id: str, proxied_path: str):
        """Open a websocket connection to a server."""
        host, port = self.get_host_and_port(server_id)
        return await self.proxy_open(host, port, proxied_path)

    # Implement the HTTP methods we used.
    async def http_get(self, server_id: str, proxied_path: str):
        return await ensure_async(self.proxy(server_id, proxied_path))

    def post(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)

    def put(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)

    def delete(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)

    def head(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)

    def patch(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)

    def options(self, server_id: str, proxied_path: str):
        return self.proxy(server_id, proxied_path)


agent_handlers: List[Tuple[str, Type[JupyterHandler], Dict]] = [
    (
        #            <server_id> <proxied_path>
        r"/secretnoteagent/(.+?)/(.*)",
        AgentHandler,
        {
            "host_allowlist": lambda *_: True,
        },
    ),
]
