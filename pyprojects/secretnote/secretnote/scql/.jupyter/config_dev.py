# This config file is used for development of `secretnote sf` Jupyter Server only.

from typing import TYPE_CHECKING
import os
from os import path

if TYPE_CHECKING:
    from traitlets.config import get_config

dirname = path.dirname(__file__)

c = get_config()

c.NotebookApp.token = ""
c.NotebookApp.password = ""

c.Application.log_level = 0

c.ServerApp.allow_origin = "*"
c.ServerApp.allow_remote_access = True
c.ServerApp.allow_root = True
c.ServerApp.disable_check_xsrf = True
c.ServerApp.token = ""
c.ServerApp.root_dir = path.abspath(path.join(dirname, "../../../../.secretnote"))
os.makedirs(c.ServerApp.root_dir, exist_ok=True)

c.LanguageServerManager.autodetect = False
