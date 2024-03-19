from typing import List, Tuple, Type

from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.utils import ensure_async
from jupyter_server_proxy.handlers import ProxyHandler

from secretnote.server.services.nodes.manager import node_manager


class AgentHandler(ProxyHandler):
    def get_host_and_port(self, server_id: str):
        if server_id != "0":
            node = node_manager.get_node(id=server_id)
            if node:
                address = node.get("address", None)
                if address:
                    [host_name, port] = address.split(":")
                    return host_name, port

        [host_name, port] = self.request.host.split(":")
        return host_name, port

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

    async def open(self, server_id: str, proxied_path: str):
        host, port = self.get_host_and_port(server_id)
        return await self.proxy_open(host, port, proxied_path)

    def proxy(self, server_id: str, proxied_path: str):
        host, port = self.get_host_and_port(server_id)
        return super().proxy(host, port, proxied_path)


agent_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/secretnoteagent/(\d)+/(.*)", AgentHandler),
]
