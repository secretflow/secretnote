from typing import Dict, Optional

from dataset import Table, connect

from secretnote.utils.path import get_db_path


class NodeManager(object):
    def __init__(self):
        db = connect(get_db_path())
        self.table: Table = db["node"]

    def ensure_node_name(self, name: Optional[str]) -> None:
        if name is not None:
            node_item = self.get_node(name=name)
            if node_item is not None:
                raise Exception("node name is already existed.")
        else:
            raise Exception("node name is required.")

    def ensure_node_address(self, address: Optional[str]) -> None:
        if address is not None:
            node_item = self.get_node(address=address)
            if node_item is not None:
                raise Exception("node address is already existed.")
        else:
            raise Exception("node address is required.")

    def add_node(self, node: Dict[str, str]):
        name = node.get("name", None)
        address = node.get("address", None)

        self.ensure_node_name(name)
        self.ensure_node_address(address)

        return self.table.insert(node)

    def remove_node(self, node_id: str) -> None:
        self.table.delete(id=node_id)

    def get_node(self, **kwargs):
        return self.table.find_one(**kwargs)

    def get_nodes(self):
        return [node for node in self.table.all()]

    def update_node(self, node_id: str, node: Dict[str, str]) -> None:
        name = node.get("name", None)
        address = node.get("address", None)

        if name is not None:
            self.ensure_node_name(name)

        if address is not None:
            self.ensure_node_address(address)

        self.table.update({"id": node_id, **node}, ["id"])


node_manager = NodeManager()
