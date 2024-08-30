from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from traitlets.config import get_config

c = get_config()

c.ServerApp.allow_origin = "*"

c.ServerApp.allow_remote_access = True

c.ServerApp.disable_check_xsrf = True

c.ServerApp.token = ""

c.ServerApp.ip = "*"

c.ServerApp.root_dir = "/home/secretnote/workspace"

c.LanguageServerManager.autodetect = False

c.LanguageServerManager.language_servers = {
    # whole notebook LSP ability.
    "libro-analyzer": {
        # if installed as a binary
        "argv": [
            "node",
            "node_modules/@difizen/libro-analyzer/index.js",
            "--stdio",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "libro-analyzer",
    },
}

c.ResourceUseDisplay.track_cpu_percent = True
