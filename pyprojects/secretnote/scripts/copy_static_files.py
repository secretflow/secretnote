import secretnote.display.core.renderer
import secretnote.server.app
from secretnote.utils.node import copy_static_files

if __name__ == "__main__":
    copy_static_files(secretnote.display.core.renderer.require)
    copy_static_files(secretnote.server.app.require)
