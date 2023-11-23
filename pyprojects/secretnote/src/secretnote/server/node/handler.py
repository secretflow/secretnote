import json
from typing import List, Tuple, Type

from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

from secretnote.server.node.nodemanager import node_table

try:
    from jupyter_client.jsonutil import json_default
except ImportError:
    from jupyter_client.jsonutil import date_default as json_default


class NodeRootHandler(APIHandler):
    @web.authenticated
    def get(self):
        data = node_table.select_all("*")
        result = []
        # print(data)
        for i in range(len(data)):
            result.append(
                {
                    "id": data[i][0],
                    "name": data[i][1],
                    "address": data[i][2],
                }
            )
        self.finish(json.dumps(result, default=json_default))

    @web.authenticated
    async def post(self):
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "No JSON data provided")

        node_id = model.get("id", None)
        node_name = model.get("name", None)
        node_address = model.get("address", None)

        if node_name is not None:
            node = node_table.select("*", name=node_name)
            if len(node) != 0:
                raise web.HTTPError(400, "node name is already in use")
        else:
            raise web.HTTPError(400, "node name is required")

        if node_address is not None:
            node = node_table.select("*", address=node_address)
            if len(node) != 0:
                raise web.HTTPError(400, "node address is already in use")
        else:
            raise web.HTTPError(400, "node address is required")

        node_table.insert(node_id, node_name, node_address)
        self.finish(json.dumps(model, default=json_default))


class NodeHandler(APIHandler):
    @web.authenticated
    async def get(self, node_id):
        data = node_table.select("*", id=node_id)
        result = []
        for i in range(len(data)):
            result.append(
                {
                    "id": data[i][0],
                    "name": data[i][1],
                    "address": data[i][2],
                }
            )
        self.finish(json.dumps(result, default=json_default))

    @web.authenticated
    async def patch(self, node_id):
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "No JSON data provided")

        node_name = model.get("name", None)
        node_address = model.get("address", None)

        if node_name is not None:
            node = node_table.select("*", name=node_name)
            if len(node) != 0:
                raise web.HTTPError(400, "node name is already in use")
            else:
                node_table.update(
                    {
                        "name": node_name,
                    },
                    id=node_id,
                )

        if node_address is not None:
            node = node_table.select("*", address=node_address)
            if len(node) != 0:
                raise web.HTTPError(400, "node address is already in use")
            else:
                node_table.update(
                    {
                        "address": node_address,
                    },
                    id=node_id,
                )

        self.finish(json.dumps(model, default=json_default))

    @web.authenticated
    async def delete(self, node_id):
        node_table.delete(id=node_id)
        self.set_status(204)
        self.finish()


_node_id_regex = r"(?P<node_id>\w+-\w+-\w+-\w+-\w+)"

nodes_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (rf"/api/nodes/{_node_id_regex}", NodeHandler),
    (r"/api/nodes", NodeRootHandler),
]
