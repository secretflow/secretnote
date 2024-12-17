# This config file is used for development of `secretnote sf` Jupyter Server only.

from typing import TYPE_CHECKING
import os
from os import path
import logging

if TYPE_CHECKING:
    from traitlets.config import get_config

dirname = path.dirname(__file__)

c = get_config()

c.Application.log_level = 0

c.ServerApp.allow_origin = "*"
c.ServerApp.allow_remote_access = True
c.ServerApp.allow_root = True
c.ServerApp.disable_check_xsrf = True
c.ServerApp.token = ""
c.ServerApp.password = ""
c.ServerApp.root_dir = path.abspath(path.join(dirname, "../../../../.secretnote"))
os.makedirs(c.ServerApp.root_dir, exist_ok=True)

c.ResourceUseDisplay.track_cpu_percent = True

c.LanguageServerManager.autodetect = False
pylez_entry = path.abspath(
    path.join(dirname, "../../../node_modules/@difizen/pylez/index.js")
)
if not path.exists(pylez_entry):
    logging.warning(f"pylez not found at {pylez_entry}. LSP will be disabled.")
c.LanguageServerManager.language_servers = {
    # `pylez` is a derived version of pyright with virtual document enabled
    # whole notebook LSP ability. Note that when it runs with --stdio, the frontend
    # is unable to see its errors output in the WebSocket messages. You might need
    # to debug it blindly. (See https://github.com/microsoft/pyright/issues/4446)
    "libro-analyzer": {
        "argv": [
            "node",
            pylez_entry,
            "--stdio",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "libro-analyzer",
    },
}
