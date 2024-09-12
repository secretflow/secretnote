# Handlers for the nodes management API.

import json
from typing import Dict, List, Tuple, Type
from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

from jupyter_server.utils import ensure_async
from jupyter_server_proxy.handlers import ProxyHandler as _ProxyHandler
from .nodes_manager import nodes_manager


class NodeRootHandler(APIHandler):
    @web.authenticated
    def get(self):
        """[GET] Get all nodes."""
        nodes = nodes_manager.get_nodes()
        self.finish(json.dumps(nodes, default=json_default))

    @web.authenticated
    async def post(self):
        """[POST] Add a new node. Returns the node and its ID."""
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "no request body provided.")

        try:
            node_id = nodes_manager.add_node(model)
        except Exception as e:
            raise web.HTTPError(400, str(e))  # noqa: B904

        self.finish(json.dumps({**model, "id": node_id}, default=json_default))


class NodeHandler(APIHandler):
    @web.authenticated
    async def get(self, node_id):
        """[GET] Get a node by ID."""
        node = nodes_manager.get_node(id=node_id)
        if node is None:
            raise web.HTTPError(404, "node not found.")
        self.finish(json.dumps(node, default=json_default))

    @web.authenticated
    async def patch(self, node_id):
        """[PATCH] Update a node by ID."""
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "no request body provided.")

        try:
            nodes_manager.update_node(node_id, model)
        except Exception as e:
            raise web.HTTPError(400, str(e))  # noqa: B904

        self.finish(json.dumps(model, default=json_default))

    @web.authenticated
    async def delete(self, node_id):
        """[DELETE] Delete a node by ID."""
        nodes_manager.remove_node(node_id)
        self.set_status(204)
        self.finish()


class NodeWithIdHandler(APIHandler):
    @web.authenticated
    async def http_get(self, node_id: str):
        node = nodes_manager.get_node(id=node_id)
        self.finish(json.dumps(node, default=json_default))

    @web.authenticated
    async def delete(self, node_id: str):
        nodes_manager.remove_node(node_id)
        self.finish()


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
        """[DELETE] Delete a node by ID."""
        raise web.HTTPError(501, "This API is not implemented in self-deployment mode.")


class ToKernelProxyHandler(_ProxyHandler):
    """Should not only handle HTTP but also WebSocket."""

    def rewrite(self, path: str):
        return path  # no rewrite by default

    async def open(self, node_id, proxied_path):
        host, port = nodes_manager.get_node(id=node_id)["podIp"].split(":")

        return await self.proxy_open(host, port, proxied_path)

    def proxy(self, node_id: str, proxied_path: str):
        print("got node >>> ", nodes_manager.get_node(id=node_id))
        host, port = nodes_manager.get_node(id=node_id)["podIp"].split(":")

        return super().proxy(host, port, self.rewrite(proxied_path))

    async def http_get(self, *args):
        print("args of get >>>", args)
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
    ("/secretnote/api/nodes/start/(.*)", NotImplementedHandler),
    ("/secretnote/api/nodes/stop/(.*)", NotImplementedHandler),
    (
        "/secretnote/(.*?)/(.*)",
        ToKernelProxyHandler,
        {
            "host_allowlist": lambda *_: True,
        },
    ),
]
