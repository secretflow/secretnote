# Manage nodes using a database.

from typing import Dict, Optional
from dataset import Table, connect

from ..utils import get_db_path


class SecretNoteNode:
    def __init__(self, id: str, name: str, status: str, service: str, podIp: str):
        self.id = id
        self.name = name
        self.status = status  # Pending, Running, Succeeded, Failed, Unknown, Terminated
        self.service = service
        self.podIp = podIp


class NodesManager(object):
    def __init__(self):
        db = connect(get_db_path())
        self.table: Table = db.get_table("node")  # type: ignore

    def ensure_name(self, name: Optional[str]) -> None:
        """Ensure that the node name is unused."""
        if name is not None:
            node_item = self.get_node(name=name)
            if node_item is not None:
                raise Exception("node name is already existed.")
        else:
            raise Exception("node name is required.")

    def ensure_pod_ip(self, podIp: Optional[str]) -> None:
        """Ensure that the node address is unused."""
        if podIp is not None:
            node_item = self.get_node(podIp=podIp)
            if node_item is not None:
                raise Exception("node podIp is already existed.")
        else:
            raise Exception("node podIp is required.")

    def add_node(self, node: Dict[str, str]):
        """Add a new node. `node` is like `{name, podIp}`. Returns the node id."""
        name = node.get("name", None)
        pod_ip = node.get("pod_ip", None)

        self.ensure_name(name)
        self.ensure_pod_ip(pod_ip)

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


nodes_manager = NodesManager()
