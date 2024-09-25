# Handlers for the nodes management API.

import json
from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler
from tornado import web

from jupyter_server.utils import ensure_async
from jupyter_server_proxy.handlers import ProxyHandler as _ProxyHandler
from .nodes_manager import nodes_manager


class NodeRootHandler(APIHandler):
    @web.authenticated
    def get(self):
        """Get all nodes."""
        nodes = nodes_manager.get_nodes()
        self.finish(json.dumps(nodes, default=json_default))

    @web.authenticated
    async def post(self):
        """Add a new node. Returns the node and its ID."""
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "no request body provided.")

        try:
            node_id = nodes_manager.add_node(model)
        except Exception as e:
            raise web.HTTPError(400, str(e))  # noqa: B904

        self.finish(json.dumps({**model, "id": node_id}, default=json_default))


class NodeWithIdHandler(APIHandler):
    @web.authenticated
    async def get(self, node_id: str):
        node = nodes_manager.get_node(id=node_id)
        self.finish(json.dumps(node, default=json_default))

    @web.authenticated
    async def delete(self, node_id: str):
        nodes_manager.remove_node(node_id)
        self.finish(json.dumps({}, default=json_default))


class NotImplementedHandler(APIHandler):
    @web.authenticated
    async def http_get(self, *_):
        raise web.HTTPError(501, "This API is not implemented in self-deployment mode.")

    @web.authenticated
    async def post(self, *_):
        raise web.HTTPError(501, "This API is not implemented in self-deployment mode.")

    @web.authenticated
    async def patch(self, *_):
        raise web.HTTPError(501, "This API is not implemented in self-deployment mode.")

    @web.authenticated
    async def delete(self, *_):
        raise web.HTTPError(501, "This API is not implemented in self-deployment mode.")


class ToRemoteJupyterServerProxyHandler(_ProxyHandler):
    """Proxy all requests to remote jupyter server running inside a container.
    Not only handles HTTP but also WebSocket."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.host_allowlist = lambda *_: True

    def check_origin(self, *_):
        return True

    def rewrite(self, path: str):
        return path

    async def open(self, node_id: str, proxied_path: str):
        """Handle WebSocket connection."""
        host, port = nodes_manager.get_node(id=node_id)["podIp"].split(":")

        return await self.proxy_open(host, port, proxied_path)

    def proxy(self, node_id: str, proxied_path: str):
        """Handle HTTP requests."""
        host, port = nodes_manager.get_node(id=node_id)["podIp"].split(":")

        return super().proxy(host, port, self.rewrite(proxied_path))

    async def http_get(self, *args):
        return await ensure_async(self.proxy(*args))

    def post(self, *args):
        return self.proxy(*args)

    def put(self, *args):
        return self.proxy(*args)

    def delete(self, *args):
        return self.proxy(*args)

    def head(self, *args):
        return self.proxy(*args)

    def patch(self, *args):
        return self.proxy(*args)

    def options(self, *args):
        return self.proxy(*args)


nodes_handlers = [
    ("/secretnote/api/nodes", NodeRootHandler),
    ("/secretnote/api/nodes/(.*)", NodeWithIdHandler),
    # we can't start/stop nodes in self-deployment mode
    ("/secretnote/api/nodes/start/(.*)", NotImplementedHandler),
    ("/secretnote/api/nodes/stop/(.*)", NotImplementedHandler),
    (
        "/secretnote/(?!static)(.*?)/(.*)",
        ToRemoteJupyterServerProxyHandler,
        {
            "host_allowlist": lambda *_: True,
        },
    ),
]
