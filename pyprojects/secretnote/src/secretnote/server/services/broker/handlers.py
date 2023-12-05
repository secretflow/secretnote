import json
from typing import List, Tuple, Type

from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

from .manager import node_manager


class NodeHandler(APIHandler):
    @web.authenticated
    async def get(self, node_id):
        node = node_manager.get_node(id=node_id)
        if node is None:
            raise web.HTTPError(404, "node not found.")
        self.finish(json.dumps(node, default=json_default))

    @web.authenticated
    async def patch(self, node_id):
        model = self.get_json_body()

        if model is None:
            raise web.HTTPError(400, "no request body provided.")

        try:
            node_manager.update_node(node_id, model)
        except Exception as e:
            raise web.HTTPError(400, str(e))  # noqa: B904

        self.finish(json.dumps(model, default=json_default))

    @web.authenticated
    async def delete(self, node_id):
        node_manager.remove_node(node_id)
        self.set_status(204)
        self.finish()


_node_id_regex = r"(?P<node_id>\d+)"

broker_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/api/broker", NodeHandler),
]
