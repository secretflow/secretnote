# Manage nodes using a database.

from typing import Dict, Optional
from dataset import Table, connect

from .utils import get_db_path


class NodesManager(object):
    def __init__(self):
        db = connect(get_db_path())
        self.table: Table = db.get_table("node")  # type: ignore

    def ensure_node_name(self, name: Optional[str]) -> None:
        """Ensure that the node name is unused."""
        if name is not None:
            node_item = self.get_node(name=name)
            if node_item is not None:
                raise Exception("node name is already existed.")
        else:
            raise Exception("node name is required.")

    def ensure_node_address(self, address: Optional[str]) -> None:
        """Ensure that the node address is unused."""
        if address is not None:
            node_item = self.get_node(address=address)
            if node_item is not None:
                raise Exception("node address is already existed.")
        else:
            raise Exception("node address is required.")

    def add_node(self, node: Dict[str, str]):
        """Add a new node. `node` is like `{name, address}`. Returns the node id."""
        name = node.get("name", None)
        address = node.get("address", None)

        self.ensure_node_name(name)
        self.ensure_node_address(address)

        return self.table.insert(node)

    def remove_node(self, node_id: str) -> None:
        """Remove a node from the database."""
        self.table.delete(id=node_id)

    def get_node(self, **kwargs):
        """Get a node from the database according to given properties.."""
        return self.table.find_one(**kwargs)

    def get_nodes(self):
        """Get all nodes from the database."""
        return [node for node in self.table.all()]

    def update_node(self, node_id: str, node: Dict[str, str]) -> None:
        """Update a node in the database according to `node_id`."""
        name = node.get("name", None)
        address = node.get("address", None)

        if name is not None:
            self.ensure_node_name(name)
        if address is not None:
            self.ensure_node_address(address)

        self.table.update({"id": node_id, **node}, ["id"])


nodes_manager = NodesManager()
