from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from traitlets.config import get_config

c = get_config()

c.Application.log_level = 0

c.ServerApp.allow_origin = "*"

c.ServerApp.allow_remote_access = True

c.ServerApp.allow_root = True

c.ServerApp.disable_check_xsrf = True

c.ServerApp.token = ""

c.ServerApp.root_dir = "../../.secretnote"

c.ServerApp.port = 8889

c.LanguageServerManager.autodetect = False

c.LanguageServerManager.language_servers = {
    "ruff-lsp": {
        # if installed as a binary
        "argv": [
            "ruff-lsp",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "ruff-lsp",
    },
    "libro-analyzer": {
        # if installed as a binary
        "argv": [
            "node",
            "../node_modules/@difizen/libro-analyzer/index.js", # TODO
            "--stdio",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "libro-analyzer",
    },
}

c.ResourceUseDisplay.track_cpu_percent = True
