import subprocess
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

c.ServerApp.root_dir = subprocess.run(
    ["git", "rev-parse", "--show-toplevel"],
    capture_output=True,
    text=True,
).stdout.strip()

c.LanguageServerManager.language_servers = {
    "pyright-extended": {
        # if installed as a binary
        "argv": [
            "node",
            "node_modules/@replit/pyright-extended/langserver.index.js",
            "--stdio",
        ],
        "languages": ["python"],
        "version": 2,
        "mime_types": ["text/x-python"],
        "display_name": "pyright-extended",
    },
}
