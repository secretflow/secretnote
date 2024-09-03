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
c.ServerApp.root_dir = "/Users/zhuoxu/workspace/secretnote/pyprojects/.secretnote"

c.ResourceUseDisplay.track_cpu_percent = True

c.LanguageServerManager.autodetect = False
c.LanguageServerManager.language_servers = {
    # `libro-analyzer` is a derived version of pyright with virtual document enabled
    # whole notebook LSP ability. Note that when it runs with --stdio, the frontend
    # is unable to see its errors output in the WebSocket messages. You might need
    # to debug it blindly. (See https://github.com/microsoft/pyright/issues/4446)
    "libro-analyzer": {
        "languages": ["python"],
        "mime_types": ["text/x-python"],
        "display_name": "libro-analyzer",
        "version": 2,
        "argv": [
            "node",
            "node_modules/@difizen/libro-analyzer/index.js",
            "--stdio",
        ],
    },
}
