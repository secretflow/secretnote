from dataset import connect

from secretnote.utils.path import get_db_path


class NodeManager:
    def __init__(self):
        db = connect(get_db_path())
        self.table = db["node"]

    def add_node(self, node):
        return self.table.insert(node)

    def remove_node(self, node_id):
        self.table.delete(id=node_id)

    def get_node(self, **kwargs):
        return self.table.find_one(**kwargs)

    def get_nodes(self):
        result = []
        for node in self.table.all():
            result.append(node)
        return result

    def update_node(self, node_id, node):
        self.table.update({"id": node_id, **node}, ["id"])


node_manager = NodeManager()
