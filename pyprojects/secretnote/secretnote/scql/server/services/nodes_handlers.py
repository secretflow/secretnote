# Handlers for the nodes management API.

import json
from typing import List, Tuple, Type
from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

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


_node_id_regex = r"(?P<node_id>.+)"
nodes_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/api/nodes", NodeRootHandler),
    (rf"/api/nodes/{_node_id_regex}", NodeHandler),
]
