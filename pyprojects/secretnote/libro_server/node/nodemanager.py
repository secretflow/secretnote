import os

from jupyter_core import paths
from libro_server.db import Table


class Node(Table):
    def __init__(self, data_file):
        super(Node, self).__init__(
            data_file, "node", ["id TEXT", "name TEXT", "address TEXT"]
        )

    def select_all(self, *args):
        cursor = super(Node, self).select_all(*args)
        results = cursor.fetchall()
        cursor.close()
        return results

    def select(self, *args, **kwargs):
        cursor = super(Node, self).select(*args, **kwargs)
        results = cursor.fetchall()
        cursor.close()
        return results

    def insert(self, *args):
        self.free(super(Node, self).insert(*args))

    def update(self, set_args, **kwargs):
        self.free(super(Node, self).update(set_args, **kwargs))

    def delete(self, **kwargs):
        self.free(super(Node, self).delete(**kwargs))

    def delete_all(self):
        self.free(super(Node, self).delete_all())

    def drop(self):
        self.free(super(Node, self).drop())


db_dir = paths.jupyter_config_dir()
if not os.path.exists(db_dir):
    os.makedirs(db_dir)
node_table = Node(db_dir + "/secretnote.db")
